"use server";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { accountsReady, getAuth } from "@/server/auth";
import { getViewer, requireViewer } from "@/server/session";
import { acceptCustomerInvitation, JobProblem } from "@/server/jobs";
import type { JobFormState } from "@/app/staff/jobs/actions";

export async function acceptJobInvitation(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  if (!accountsReady()) return { status: "error", message: "Accounts are not switched on." };
  const token = String(form.get("token") ?? "").slice(0, 100), password = String(form.get("password") ?? "").slice(0, 500);
  let destination: string;
  try {
    // Existing-account acceptance is a protected action; a new account uses its invitation proof.
    const viewer = form.get("existing") === "yes" ? await requireViewer(["customer", "staff", "owner"], `/job-invite?token=${encodeURIComponent(token)}`) : await getViewer();
    const result = await acceptCustomerInvitation(token, viewer, password);
    if (result.created) {
      try { await (await getAuth()).api.signInEmail({ body: { email: result.email, password }, headers: await headers() }); }
      catch { redirect(`/sign-in?next=${encodeURIComponent(`/account/jobs/${result.reference}`)}`); }
    }
    destination = `/account/jobs/${result.reference}`;
  } catch (error) { unstable_rethrow(error); return { status: "error", message: error instanceof JobProblem ? error.message : "We could not finish setup. Please try again or contact Mias." }; }
  redirect(destination);
}
