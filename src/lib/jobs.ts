// Pure rules for increment 008; exercised through the Node/pytest bridge.
export const requestStages = { received: "Received", "under-review": "Under review", "awaiting-information": "Awaiting information", accepted: "Accepted", closed: "Closed" } as const;
export const jobStages = { assessment: "Assessment", "awaiting-quotation": "Awaiting quotation decision", scheduled: "Scheduled", "in-progress": "In progress", "on-hold": "On hold", completed: "Completed", cancelled: "Cancelled" } as const;
export type JobStage = keyof typeof jobStages;
export type NotificationChannel = "email" | "sms";
const transitions: Record<JobStage, readonly JobStage[]> = {
  assessment: ["awaiting-quotation", "scheduled", "on-hold", "cancelled"],
  "awaiting-quotation": ["assessment", "scheduled", "on-hold", "cancelled"],
  scheduled: ["assessment", "in-progress", "on-hold", "cancelled"],
  "in-progress": ["scheduled", "completed", "on-hold", "cancelled"],
  "on-hold": ["assessment", "awaiting-quotation", "scheduled", "in-progress", "cancelled"],
  completed: [], cancelled: [],
};
export function jobTransitionProblem(before: string, after: string): string | null {
  if (!Object.hasOwn(jobStages, before) || !Object.hasOwn(jobStages, after)) return "Choose a valid job stage.";
  if (before === after) return null;
  return transitions[before as JobStage].includes(after as JobStage) ? null : `A job cannot move from ${jobStages[before as JobStage]} to ${jobStages[after as JobStage]}.`;
}
export function parseVersion(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}
export type JobDetailsInput = { scope: string; nextStep: string; assigneeId: string; reason: string; expectedVersion: string };
export function validateJobDetails(input: JobDetailsInput) {
  const scope = input.scope.trim(), nextStep = input.nextStep.trim(), assigneeId = input.assigneeId.trim(), reason = input.reason.trim();
  const expectedVersion = parseVersion(input.expectedVersion), errors: Record<string, string> = {};
  if (!scope || scope.length > 1500) errors.scope = "Describe the agreed work (1–1,500 characters).";
  if (!nextStep || nextStep.length > 500) errors.nextStep = "Enter the next step (1–500 characters).";
  if (!assigneeId || assigneeId.length > 128) errors.assigneeId = "Choose the responsible staff member.";
  if (!reason || reason.length > 500) errors.reason = "Record the reason (1–500 characters).";
  if (expectedVersion === null) errors.expectedVersion = "Reload this page before trying again.";
  return Object.keys(errors).length ? { ok: false as const, errors } : { ok: true as const, value: { scope, nextStep, assigneeId, reason, expectedVersion: expectedVersion! } };
}
export function notificationDestinations(contact: { email: string | null; phone: string | null }): { channel: NotificationChannel; recipient: string }[] {
  return [...(contact.email ? [{ channel: "email" as const, recipient: contact.email }] : []), ...(contact.phone ? [{ channel: "sms" as const, recipient: contact.phone }] : [])];
}
export function receiptText(reference: string) {
  return { subject: `Mias request received: ${reference}`, body: `Mias Energy Solutions has received your request. Reference: ${reference}. Our team will review it and contact you. Work has not yet been confirmed.` };
}
export function acceptanceText(reference: string, scope: string, nextStep: string) {
  return { subject: `Mias request accepted: ${reference}`, body: `Mias Energy Solutions has accepted your request for ${scope}. Job reference: ${reference}. Next step: ${nextStep}.` };
}
