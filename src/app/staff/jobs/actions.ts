"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { parseVersion } from "@/lib/jobs";
import { requireViewer } from "@/server/session";
import { acceptInquiry, addJobMessage, cancelCustomerInvitation, inviteJobCustomer, JobProblem, jobNotifications, reviewInquiry, revokeCustomer, updateJob } from "@/server/jobs";
import { deliverRows, type Simulation } from "@/server/mail/outbox";

export type JobFormState = { status: "idle" } | { status: "done"; message: string; baseVersion?: number } | { status: "error"; message: string; values?: Record<string, string>; baseVersion?: number };
const read = (form: FormData, name: string) => typeof form.get(name) === "string" ? String(form.get(name)).slice(0, 4000) : "";
const details = (form: FormData) => ({ scope: read(form, "scope"), nextStep: read(form, "nextStep"), assigneeId: read(form, "assigneeId"), reason: read(form, "reason"), expectedVersion: read(form, "expectedVersion") });
const version = (form: FormData) => { const result = parseVersion(read(form, "expectedVersion")); if (result === null) throw new JobProblem("Reload this page before trying again."); return result; };
const simulation = async (): Promise<Simulation> => {
  if (process.env.NODE_ENV !== "development") return null;
  const value = (await cookies()).get("mias-simulate")?.value;
  return ["db-failure", "notify-failure", "email-failure", "sms-failure"].includes(value ?? "") ? value as Simulation : null;
};
const done = (reference: string, message: string, baseVersion?: number): JobFormState => {
  revalidatePath("/staff"); revalidatePath("/staff/jobs"); revalidatePath(`/staff/jobs/${reference}`); revalidatePath("/account"); revalidatePath(`/account/jobs/${reference}`);
  return { status: "done", message, baseVersion };
};
const failed = (error: unknown, form: FormData): JobFormState => {
  unstable_rethrow(error);
  // React resets uncontrolled fields after a completed action. Return the draft on errors;
  // passwords, invitation tokens and event keys are deliberately excluded.
  const values = Object.fromEntries(["scope", "nextStep", "assigneeId", "reason", "stage", "name", "email", "body", "reviewStatus"].map(name => [name, read(form, name)]));
  return { status: "error", message: error instanceof JobProblem ? error.message : "We could not save that change. Please reload and try again.", values, baseVersion: parseVersion(read(form, "expectedVersion")) ?? undefined };
};

export async function acceptRequest(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff");
  let reference: string;
  try { reference = await acceptInquiry(viewer, read(form, "reference"), details(form), await simulation()); }
  catch (error) { return failed(error, form); }
  // An explicit destination anchor replaces the inquiry shortcut's fragment on plain 303 redirects.
  revalidatePath("/staff"); redirect(`/staff/jobs/${reference}#main-content`);
}
export async function reviewRequest(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff");
  try {
    const reference = read(form, "reference");
    await reviewInquiry(viewer, reference, read(form, "reviewStatus"), read(form, "reason"), version(form));
    revalidatePath(`/staff/inquiries/${reference}`); return done(reference, "Request review saved.", version(form) + 1);
  } catch (error) { return failed(error, form); }
}
export async function saveJob(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try { const reference = read(form, "reference"); await updateJob(viewer, reference, { ...details(form), stage: read(form, "stage") }); return done(reference, "Job updated.", version(form) + 1); }
  catch (error) { return failed(error, form); }
}
export async function staffMessage(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try { const reference = read(form, "reference"), kind = read(form, "kind"); await addJobMessage(viewer, reference, read(form, "body"), kind, read(form, "eventKey")); return done(reference, kind === "note" ? "Private note saved." : "Customer update saved."); }
  catch (error) { return failed(error, form); }
}
export async function inviteCustomer(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try {
    const reference = read(form, "reference");
    await inviteJobCustomer(viewer, reference, { name: read(form, "name"), email: read(form, "email"), checked: read(form, "checked") === "yes", expectedVersion: version(form) }, await simulation());
    return done(reference, "Customer invitation saved. Its delivery status is listed below.", version(form) + 1);
  } catch (error) { return failed(error, form); }
}
export async function revokeAccess(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try { const reference = read(form, "reference"); await revokeCustomer(viewer, reference, read(form, "reason"), version(form)); done(reference, "Customer access revoked."); redirect(`/staff/jobs/${encodeURIComponent(reference)}?notice=access-revoked`); }
  catch (error) { return failed(error, form); }
}
export async function cancelCustomerInvite(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try { const reference = read(form, "reference"); await cancelCustomerInvitation(viewer, reference, read(form, "invitationId"), version(form)); done(reference, "Invitation cancelled."); redirect(`/staff/jobs/${encodeURIComponent(reference)}?notice=invitation-cancelled`); }
  catch (error) { return failed(error, form); }
}
export async function retryJobNotifications(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs");
  try {
    const reference = read(form, "reference"), rows = await jobNotifications(viewer, reference);
    await deliverRows(rows.filter(row => ["pending", "failed"].includes(row.status) && row.attempts < 4).map(row => row.id), await simulation());
    return done(reference, "Eligible notifications retried. Check each delivery status below.");
  } catch (error) { return failed(error, form); }
}
