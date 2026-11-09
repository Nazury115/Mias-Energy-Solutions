"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { passwordProblem, safeNextPath, validateSignUp } from "@/lib/accounts";
import { normalizePhone } from "@/lib/inquiry-submission";
import { accountsReady, getAuth } from "@/server/auth";
import { recordAttempt, tooManyAttempts } from "@/server/attempts";
import { hashNetworkAddress } from "@/server/form-token";
import { networkAddress } from "@/server/network-address";
import { requireViewer } from "@/server/session";
import { acceptInvitation } from "@/server/team";

export type AccountFormState =
  | { status: "idle" }
  | { status: "error"; message?: string; errors?: Record<string, string>; values: Record<string, string> }
  | { status: "unverified"; email: string }
  | { status: "done"; message?: string; values?: Record<string, string> };

const unavailable: AccountFormState = { status: "error", message: "Accounts aren’t switched on for this version of the site.", values: {} };
const read = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.slice(0, 500) : "";
};
async function networkKey() {
  const request = await headers();
  const address = networkAddress(request);
  return `network:${hashNetworkAddress(address)}`;
}
const MINUTE = 60_000;
const invitationProblems: Record<string, string> = {
  used: "This invitation has already been used. Sign in instead, or ask an Owner for a new invitation.",
  expired: "This invitation has expired. Ask an Owner to send a new one.",
  cancelled: "This invitation was cancelled. Ask an Owner if you think this is a mistake.",
  invalid: "This invitation link isn’t valid. Check that you copied the whole link.",
};

/** AUTH-01: an existing email gets the same "check your email" answer; Better Auth emails that address a notice instead. */
export async function signUp(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!accountsReady()) return unavailable;
  const values = { name: read(formData, "name"), email: read(formData, "email"), phone: read(formData, "phone"), password: read(formData, "password") };
  const checked = validateSignUp(values);
  if (!checked.ok) return { status: "error", errors: checked.errors, values: { ...values, password: "" } };
  try {
    const auth = await getAuth();
    await auth.api.signUpEmail({ body: { name: checked.value.name, email: checked.value.email, password: checked.value.password, phone: checked.value.phone ?? undefined }, headers: await headers() });
  } catch (error) {
    console.error(`Sign-up failed: ${(error as Error).message}`);
    return { status: "error", message: "We couldn’t create your account just now. Please try again in a moment.", values: { ...values, password: "" } };
  }
  return { status: "done", values: { email: checked.value.email } };
}

/** AUTH-03: one message for any wrong combination; 5 failures per account or network in 15 minutes pause sign-in. */
export async function signIn(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!accountsReady()) return unavailable;
  const email = read(formData, "email").trim().toLowerCase(), password = read(formData, "password");
  const next = safeNextPath(read(formData, "next"));
  const keys = [`account:${email}`, await networkKey()];
  if (await tooManyAttempts("sign-in-failure", keys, 5, 15 * MINUTE)) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes before trying again, or reset your password.", values: { email } };
  }
  let role = "customer";
  try {
    const result = await (await getAuth()).api.signInEmail({ body: { email, password }, headers: await headers() });
    role = (result.user as { role?: string }).role ?? "customer";
  } catch (error) {
    if (isAPIError(error) && (error.body as { code?: string } | undefined)?.code === "EMAIL_NOT_VERIFIED") return { status: "unverified", email };
    await recordAttempt("sign-in-failure", keys);
    return { status: "error", message: "That email and password don’t match an account.", values: { email } };
  }
  redirect(next ?? (role === "customer" ? "/account" : "/staff"));
}

export async function resendConfirmation(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const email = read(formData, "email").trim().toLowerCase();
  const keys = [`account:${email}`, await networkKey()];
  if (accountsReady() && email && !(await tooManyAttempts("verification-request", keys, 3, 60 * MINUTE))) {
    await recordAttempt("verification-request", keys);
    try { await (await getAuth()).api.sendVerificationEmail({ body: { email } }); } catch { /* unknown or already confirmed: same answer */ }
  }
  return { status: "done", message: "If that account still needs confirming, we’ve sent a new link. It expires in 24 hours." };
}

/** AUTH-04: always the same answer, so the form never reveals whether an email is registered. */
export async function forgotPassword(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const email = read(formData, "email").trim().toLowerCase();
  const keys = [`account:${email}`, await networkKey()];
  if (accountsReady() && email && !(await tooManyAttempts("reset-request", keys, 3, 60 * MINUTE))) {
    await recordAttempt("reset-request", keys);
    try { await (await getAuth()).api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" } }); } catch { /* same answer */ }
  }
  return { status: "done", message: "If an account exists for that email, we’ve sent a link to reset the password. It expires in 1 hour." };
}

export async function resetPassword(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!accountsReady()) return unavailable;
  const token = read(formData, "token"), password = read(formData, "password");
  const problem = passwordProblem(password);
  if (problem) return { status: "error", errors: { password: problem }, values: {} };
  try {
    await (await getAuth()).api.resetPassword({ body: { newPassword: password, token } });
  } catch {
    return { status: "error", message: "This reset link isn’t valid or has expired. Ask for a new one from the sign-in page.", values: {} };
  }
  return { status: "done" };
}

export async function signOut() {
  try { await (await getAuth()).api.signOut({ headers: await headers() }); } catch { /* already signed out */ }
  redirect("/");
}

export async function updateProfile(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  await requireViewer(["customer", "staff", "owner"], "/account");
  const name = read(formData, "name").trim(), rawPhone = read(formData, "phone").trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  const errors: Record<string, string> = {};
  if (!name || name.length > 80) errors.name = "Enter your name (80 characters or fewer).";
  if (rawPhone && !phone) errors.phone = "Enter a phone number such as 0977 123 456.";
  if (Object.keys(errors).length) return { status: "error", errors, values: { name, phone: rawPhone } };
  await (await getAuth()).api.updateUser({ body: { name, phone: phone ?? "" }, headers: await headers() });
  return { status: "done", message: "Your details are saved." };
}

/** INV-02: the invitation is claimed before the account exists, so a link can never be used twice. */
export async function joinFromInvitation(_previous: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!accountsReady()) return unavailable;
  const token = read(formData, "token"), password = read(formData, "password");
  const result = await acceptInvitation(token, password);
  if (!result.ok) {
    const message = invitationProblems[result.problem];
    return message ? { status: "error", message, values: {} } : { status: "error", errors: { password: result.problem }, values: {} };
  }
  await (await getAuth()).api.signInEmail({ body: { email: result.email, password }, headers: await headers() });
  redirect("/staff");
}
