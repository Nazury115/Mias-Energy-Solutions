// Account rules shared by the server and exercised directly by pytest through Node (spec 007).
import { normalizePhone } from "./inquiry-submission.ts";

export const roles = ["customer", "staff", "owner"] as const;
export type Role = (typeof roles)[number];
export type AccountStatus = "active" | "deactivated";

// Long-but-common passwords (anything shorter is already refused by the length rule).
const commonPasswords = new Set([
  "password123", "password1234", "password12", "passw0rd123", "p@ssw0rd123", "1234567890", "0123456789", "1234567891",
  "9876543210", "1111111111", "0000000000", "123456789a", "a123456789", "abcd123456", "123456abcd", "qwertyuiop",
  "qwerty1234", "qwerty123456", "qwertyuiop123", "1q2w3e4r5t", "1qaz2wsx3edc", "zaq12wsxcde3", "asdfghjkl1", "asdfghjkl123",
  "iloveyou123", "princess123", "football123", "baseball123", "welcome123", "sunshine123", "letmein123", "monkey1234",
  "dragon1234", "abcdefghij", "administrator", "changeme123", "password2024", "password2025", "password2026", "welcome2024",
  "zambia1234", "zambia12345", "lusaka1234", "lusaka12345", "mias123456", "miasenergy", "miasenergy123",
]);

export function passwordProblem(password: string, context: { email?: string; name?: string } = {}): string | null {
  if (password.length < 10) return "Use at least 10 characters. A few words together works well.";
  if (password.length > 128) return "Use 128 characters or fewer.";
  const lower = password.toLowerCase();
  if (commonPasswords.has(lower) || /^(.)\1+$/.test(password)) return "That password is too common. Try a few unrelated words.";
  const email = context.email?.trim().toLowerCase() ?? "";
  if (email && (lower === email || lower === email.split("@")[0])) return "Don’t use your email address as your password.";
  if (context.name && lower === context.name.trim().toLowerCase()) return "Don’t use your name as your password.";
  return null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export type SignUpInput = { name: string; email: string; phone: string; password: string };
export type SignUpErrors = Partial<Record<keyof SignUpInput, string>>;

export function validateSignUp(input: SignUpInput): { ok: true; value: { name: string; email: string; phone: string | null; password: string } } | { ok: false; errors: SignUpErrors } {
  const name = input.name.trim(), email = input.email.trim().toLowerCase(), rawPhone = input.phone.trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  const errors: SignUpErrors = {};
  if (!name) errors.name = "Enter your name.";
  else if (name.length > 80) errors.name = "Use 80 characters or fewer for your name.";
  if (!emailPattern.test(email) || email.length > 254) errors.email = "Enter an email address such as name@example.com.";
  if (rawPhone && !phone) errors.phone = "Enter a phone number such as 0977 123 456 or +260 977 123 456.";
  const problem = passwordProblem(input.password, { email, name });
  if (problem) errors.password = problem;
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, email, phone, password: input.password } };
}

/** Staff and Owners see everyone's inquiries, so their sessions end 12 hours after signing in (D-2). */
export function sessionTooOld(role: string, createdAtMs: number, nowMs: number): boolean {
  return (role === "staff" || role === "owner") && nowMs - createdAtMs > 12 * 3_600_000;
}

export type InvitationTimes = { expiresAt: string | Date; acceptedAt: string | Date | null; cancelledAt: string | Date | null };
export function invitationState(invitation: InvitationTimes, now: string | Date = new Date()): "valid" | "used" | "cancelled" | "expired" {
  if (invitation.acceptedAt) return "used";
  if (invitation.cancelledAt) return "cancelled";
  return new Date(invitation.expiresAt).getTime() <= new Date(now).getTime() ? "expired" : "valid";
}

/** Owners can change anything except removing the last active Owner (ROLE-04). */
export function ownerChangeProblem(change: { activeOwners: number; targetRole: string; targetStatus: string; newRole?: string; newStatus?: string }): string | null {
  const isActiveOwner = change.targetRole === "owner" && change.targetStatus === "active";
  const losesOwner = (change.newRole !== undefined && change.newRole !== "owner") || change.newStatus === "deactivated";
  return isActiveOwner && losesOwner && change.activeOwners <= 1 ? "Mias needs at least one active Owner. Add another Owner first." : null;
}

/** Only same-site paths are followed after signing in, so links can't send people to other websites. */
export function safeNextPath(value: string): string | null {
  return /^\/(?![/\\])[^\s\\]*$/.test(value) && value.length <= 200 ? value : null;
}
