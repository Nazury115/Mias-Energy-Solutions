import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { invitationState, passwordProblem } from "@/lib/accounts";
import { acceptanceText, jobStages, jobTransitionProblem, notificationDestinations, requestStages, type JobDetailsInput, validateJobDetails } from "@/lib/jobs";
import { siteUrl } from "@/lib/site-metadata";
import { getAuth } from "@/server/auth";
import { getDb } from "@/server/db/client";
import { account, auditLog, customerInvitations, inquiries, jobEvents, jobs, notifications, user } from "@/server/db/schema";
import { deliverRows, type Simulation } from "@/server/mail/outbox";
import type { Viewer } from "@/server/session";

const conflict = "This record changed while you were editing. Reload the page and try again.";
const staff = (viewer: Viewer) => { if (viewer.role !== "staff" && viewer.role !== "owner") notFound(); };
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const cleanReference = (reference: string) => reference.trim().toUpperCase();
const keyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export class JobProblem extends Error {}

export async function activeStaff() {
  return (await getDb()).select({ id: user.id, name: user.name }).from(user).where(and(inArray(user.role, ["staff", "owner"]), eq(user.status, "active"))).orderBy(user.name);
}

export async function jobForInquiry(inquiryId: string) {
  const [job] = await (await getDb()).select({ reference: jobs.reference }).from(jobs).where(eq(jobs.inquiryId, inquiryId));
  return job ?? null;
}

export async function reviewInquiry(viewer: Viewer, reference: string, status: string, reason: string, version: number) {
  staff(viewer);
  if (!["received", "under-review", "awaiting-information", "closed"].includes(status) || !reason.trim() || reason.trim().length > 500) throw new JobProblem("Choose a review status and enter a reason (500 characters or fewer).");
  const db = await getDb();
  await db.transaction(async tx => {
    const [row] = await tx.update(inquiries).set({ reviewStatus: status, reviewReason: reason.trim(), version: sql`${inquiries.version} + 1` })
      .where(and(eq(inquiries.reference, cleanReference(reference)), eq(inquiries.version, version), inArray(inquiries.reviewStatus, ["received", "under-review", "awaiting-information", "closed"]))).returning({ id: inquiries.id });
    if (!row) throw new JobProblem(conflict);
    await tx.insert(auditLog).values({ actorId: viewer.id, action: "inquiry.review", detail: `${cleanReference(reference)}: ${requestStages[status as keyof typeof requestStages]} — ${reason.trim()}` });
  });
}

export async function acceptInquiry(viewer: Viewer, reference: string, input: JobDetailsInput, simulate: Simulation = null): Promise<string> {
  staff(viewer);
  const checked = validateJobDetails(input);
  if (!checked.ok) throw new JobProblem(Object.values(checked.errors)[0]);
  const { expectedVersion, reason, ...details } = checked.value;
  const db = await getDb();
  const result = await db.transaction(async tx => {
    const [existing] = await tx.select({ reference: jobs.reference }).from(jobs).innerJoin(inquiries, eq(inquiries.id, jobs.inquiryId)).where(eq(inquiries.reference, cleanReference(reference)));
    if (existing) return { reference: existing.reference, noteIds: [] as string[] };
    const [assignee] = await tx.select({ id: user.id }).from(user).where(and(eq(user.id, details.assigneeId), eq(user.status, "active"), inArray(user.role, ["staff", "owner"])));
    if (!assignee) throw new JobProblem("Choose an active staff member.");
    const [inquiry] = await tx.update(inquiries).set({ reviewStatus: "accepted", reviewReason: reason, version: sql`${inquiries.version} + 1` })
      .where(and(eq(inquiries.reference, cleanReference(reference)), eq(inquiries.version, expectedVersion), inArray(inquiries.reviewStatus, ["received", "under-review", "awaiting-information"]))).returning();
    if (!inquiry) throw new JobProblem(conflict);
    const jobReference = `JOB-${new Date().getFullYear().toString().slice(-2)}-${randomBytes(6).toString("hex").toUpperCase()}`;
    const [job] = await tx.insert(jobs).values({ reference: jobReference, inquiryId: inquiry.id, ...details }).returning();
    await tx.insert(jobEvents).values([
      { jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "customer", kind: "created", body: `Request accepted. ${details.scope}\nNext step: ${details.nextStep}`, eventKey: `created:${inquiry.id}` },
      { jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "staff", kind: "acceptance-reason", body: reason },
    ]);
    const rows = notificationDestinations(inquiry).map(destination => ({ ...destination, inquiryId: inquiry.id, jobId: job.id, kind: "request-accepted",
      eventKey: `accepted:${inquiry.id}:${destination.channel}`, ...acceptanceText(jobReference, details.scope, details.nextStep) }));
    const notes = rows.length ? await tx.insert(notifications).values(rows).returning({ id: notifications.id }) : [];
    return { reference: jobReference, noteIds: notes.map(row => row.id) };
  });
  await deliverRows(result.noteIds, simulate);
  return result.reference;
}

export async function listJobs(viewer: Viewer, query = "", stage = "") {
  const db = await getDb();
  const filters = [];
  if (viewer.role === "customer") filters.push(eq(jobs.customerId, viewer.id)); else staff(viewer);
  if (Object.hasOwn(jobStages, stage)) filters.push(eq(jobs.stage, stage));
  if (query.trim()) filters.push(or(sql`strpos(lower(${jobs.reference}), ${query.trim().toLowerCase()}) > 0`, sql`strpos(lower(${jobs.scope}), ${query.trim().toLowerCase()}) > 0`)!);
  return db.select({ reference: jobs.reference, scope: jobs.scope, stage: jobs.stage, nextStep: jobs.nextStep, updatedAt: jobs.updatedAt }).from(jobs).where(and(...filters)).orderBy(desc(jobs.updatedAt));
}

/** The SQL filter excludes other jobs before their data is selected. */
export async function readJob(viewer: Viewer, reference: string) {
  const db = await getDb();
  const isStaff = viewer.role === "staff" || viewer.role === "owner";
  const [job] = await db.select().from(jobs).where(and(eq(jobs.reference, cleanReference(reference)), ...(isStaff ? [] : [eq(jobs.customerId, viewer.id)])));
  if (!job) notFound();
  const events = await db.select({ id: jobEvents.id, kind: jobEvents.kind, actorName: jobEvents.actorName, body: jobEvents.body, audience: jobEvents.audience, createdAt: jobEvents.createdAt }).from(jobEvents)
    .where(and(eq(jobEvents.jobId, job.id), ...(isStaff ? [] : [eq(jobEvents.audience, "customer")]))).orderBy(jobEvents.createdAt, jobEvents.id);
  return { job, events };
}

export async function staffJobDetails(viewer: Viewer, reference: string) {
  staff(viewer);
  const result = await readJob(viewer, reference), db = await getDb();
  const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, result.job.inquiryId));
  const [customer] = result.job.customerId ? await db.select({ name: user.name, email: user.email }).from(user).where(eq(user.id, result.job.customerId)) : [];
  const pending = await db.select({ id: customerInvitations.id, email: customerInvitations.email, expiresAt: customerInvitations.expiresAt, acceptedAt: customerInvitations.acceptedAt, cancelledAt: customerInvitations.cancelledAt }).from(customerInvitations)
    .where(and(eq(customerInvitations.jobId, result.job.id), isNull(customerInvitations.acceptedAt), isNull(customerInvitations.cancelledAt))).orderBy(desc(customerInvitations.createdAt));
  return { ...result, inquiry, customer: customer ?? null, pending: pending.filter(invite => invitationState(invite) === "valid"), people: await activeStaff() };
}

export async function updateJob(viewer: Viewer, reference: string, input: JobDetailsInput & { stage: string }) {
  staff(viewer);
  const checked = validateJobDetails(input);
  if (!checked.ok) throw new JobProblem(Object.values(checked.errors)[0]);
  const db = await getDb(), { expectedVersion, reason, ...details } = checked.value;
  await db.transaction(async tx => {
    const [before] = await tx.select().from(jobs).where(eq(jobs.reference, cleanReference(reference)));
    if (!before) notFound();
    if (["completed", "cancelled"].includes(before.stage)) throw new JobProblem("This job is closed. Its history is retained.");
    const problem = jobTransitionProblem(before.stage, input.stage);
    if (problem) throw new JobProblem(problem);
    const [assignee] = await tx.select({ id: user.id }).from(user).where(and(eq(user.id, details.assigneeId), eq(user.status, "active"), inArray(user.role, ["staff", "owner"])));
    if (!assignee) throw new JobProblem("Choose an active staff member.");
    const changed = await tx.update(jobs).set({ ...details, stage: input.stage, version: sql`${jobs.version} + 1`, updatedAt: new Date() })
      .where(and(eq(jobs.id, before.id), eq(jobs.version, expectedVersion))).returning({ id: jobs.id });
    if (!changed.length) throw new JobProblem(conflict);
    await tx.insert(jobEvents).values([
      { jobId: before.id, actorId: viewer.id, actorName: viewer.name, audience: "customer", kind: "progress", body: `${jobStages[input.stage as keyof typeof jobStages]}\nAgreed work: ${details.scope}\nNext step: ${details.nextStep}` },
      { jobId: before.id, actorId: viewer.id, actorName: viewer.name, audience: "staff", kind: "change-reason", body: `${reason}\nResponsible staff: ${details.assigneeId}` },
    ]);
  });
}

export async function addJobMessage(viewer: Viewer, reference: string, body: string, kind: string, eventKey: string) {
  const text = body.trim();
  if (!text || text.length > 2000 || !keyPattern.test(eventKey)) throw new JobProblem("Enter a message (1–2,000 characters) and try again.");
  if (viewer.role === "customer" && kind !== "message") notFound();
  if (!["message", "update", "note"].includes(kind)) throw new JobProblem("Choose a valid message type.");
  const db = await getDb();
  await db.transaction(async tx => {
    // Lock the job while authorizing and writing, so revocation cannot race a customer post.
    const [job] = await tx.select().from(jobs).where(and(eq(jobs.reference, cleanReference(reference)), ...(viewer.role === "customer" ? [eq(jobs.customerId, viewer.id)] : []))).for("update");
    if (!job) notFound();
    const [existing] = await tx.select({ id: jobEvents.id }).from(jobEvents).where(eq(jobEvents.eventKey, `message:${job.id}:${viewer.id}:${eventKey}`));
    if (existing) return;
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: kind === "note" ? "staff" : "customer", kind,
      body: text, eventKey: `message:${job.id}:${viewer.id}:${eventKey}` });
    if (kind !== "note") await tx.update(jobs).set({ updatedAt: new Date() }).where(eq(jobs.id, job.id));
  });
}

export async function inviteJobCustomer(viewer: Viewer, reference: string, input: { name: string; email: string; checked: boolean; expectedVersion: number }, simulate: Simulation = null) {
  staff(viewer);
  const name = input.name.trim(), email = input.email.trim().toLowerCase();
  if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254 || !input.checked) throw new JobProblem("Enter a name and email, and confirm that you checked the customer's identity and contact details.");
  const db = await getDb(), token = randomBytes(32).toString("base64url");
  const noteId = await db.transaction(async tx => {
    const [job] = await tx.select().from(jobs).where(eq(jobs.reference, cleanReference(reference))).for("update");
    if (!job) notFound();
    if (job.version !== input.expectedVersion) throw new JobProblem(conflict);
    if (job.customerId) throw new JobProblem("Revoke existing customer access before inviting another customer.");
    const [{ value: count }] = await tx.select({ value: sql<number>`count(*)::int` }).from(customerInvitations).where(and(eq(customerInvitations.jobId, job.id), gt(customerInvitations.createdAt, new Date(Date.now() - 3_600_000))));
    if (count >= 3) throw new JobProblem("Three invitations have been created recently. Wait an hour before sending another.");
    await tx.update(customerInvitations).set({ cancelledAt: new Date() }).where(and(eq(customerInvitations.jobId, job.id), isNull(customerInvitations.acceptedAt), isNull(customerInvitations.cancelledAt)));
    await tx.update(notifications).set({ status: "cancelled" }).where(and(eq(notifications.jobId, job.id), eq(notifications.kind, "job-invitation"), inArray(notifications.status, ["pending", "failed"])));
    const [invite] = await tx.insert(customerInvitations).values({ jobId: job.id, name, email, tokenHash: hashToken(token), invitedBy: viewer.id, expiresAt: new Date(Date.now() + 7 * 86_400_000) }).returning({ id: customerInvitations.id });
    const url = `${siteUrl}/job-invite?token=${encodeURIComponent(token)}`;
    const [note] = await tx.insert(notifications).values({ jobId: job.id, kind: "job-invitation", recipient: email, channel: "email", eventKey: `job-invite:${invite.id}`,
      subject: "Your Mias customer portal invitation", body: `Hello ${name},\n\nMias Energy Solutions invites you to set up access to your job.\n${url}\n\nThis link expires in 7 days and works once. If you already have an account, sign in using the invited email to accept access.` }).returning({ id: notifications.id });
    await tx.update(jobs).set({ version: sql`${jobs.version} + 1` }).where(eq(jobs.id, job.id));
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "staff", kind: "access-invited", body: `Customer identity and contact reviewed; invitation sent to ${email}.` });
    return note.id;
  });
  await deliverRows([noteId], simulate);
}

/** No job description is exposed before the invitation is accepted. */
export async function findCustomerInvitation(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const [invite] = await (await getDb()).select({ id: customerInvitations.id, jobId: customerInvitations.jobId, name: customerInvitations.name, email: customerInvitations.email,
    expiresAt: customerInvitations.expiresAt, acceptedAt: customerInvitations.acceptedAt, cancelledAt: customerInvitations.cancelledAt }).from(customerInvitations).where(eq(customerInvitations.tokenHash, hashToken(token)));
  return invite ? { ...invite, state: invitationState(invite) } : null;
}

export async function acceptCustomerInvitation(token: string, viewer: Viewer | null, password: string) {
  const invite = await findCustomerInvitation(token);
  if (!invite || invite.state !== "valid") throw new JobProblem(`This invitation ${invite?.state === "used" ? "has already been used" : invite?.state === "cancelled" ? "was cancelled" : invite?.state === "expired" ? "has expired" : "is not valid"}. Ask Mias for a new invitation.`);
  if (viewer && viewer.email.toLowerCase() !== invite.email) throw new JobProblem("Sign in with the email address this invitation was sent to.");
  let hash: string | null = null;
  if (!viewer) {
    const problem = passwordProblem(password, { email: invite.email, name: invite.name });
    if (problem) throw new JobProblem(problem);
    hash = await (await (await getAuth()).$context).password.hash(password);
  }
  const db = await getDb();
  return db.transaction(async tx => {
    const [job] = await tx.select().from(jobs).where(eq(jobs.id, invite.jobId)).for("update");
    if (!job || job.customerId) throw new JobProblem("This invitation no longer grants access. Contact Mias.");
    let customerId: string;
    if (viewer) {
      const [person] = await tx.select().from(user).where(and(eq(user.id, viewer.id), eq(user.email, invite.email), eq(user.emailVerified, true), eq(user.status, "active")));
      if (!person) throw new JobProblem("Confirm your email and sign in with the invited address before accepting.");
      customerId = person.id;
    } else {
      const [existing] = await tx.select({ id: user.id }).from(user).where(eq(user.email, invite.email));
      if (existing) throw new JobProblem("Sign in with the invited email to accept access, or use Forgot password.");
      customerId = randomUUID();
      // Better Auth credential model, committed atomically with invitation claim and access.
      await tx.insert(user).values({ id: customerId, name: invite.name, email: invite.email, emailVerified: true, role: "customer", status: "active" });
      await tx.insert(account).values({ id: randomUUID(), accountId: customerId, providerId: "credential", userId: customerId, password: hash! });
    }
    const claimed = await tx.update(customerInvitations).set({ acceptedAt: new Date() }).where(and(eq(customerInvitations.id, invite.id), isNull(customerInvitations.acceptedAt), isNull(customerInvitations.cancelledAt), gt(customerInvitations.expiresAt, new Date()))).returning({ id: customerInvitations.id });
    if (!claimed.length) throw new JobProblem("This invitation has already been used or is no longer valid.");
    await tx.update(jobs).set({ customerId, version: sql`${jobs.version} + 1` }).where(eq(jobs.id, job.id));
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: customerId, actorName: invite.name, audience: "staff", kind: "access-accepted", body: `${invite.email} accepted verified access.` });
    return { email: invite.email, reference: job.reference, created: !viewer };
  });
}

export async function revokeCustomer(viewer: Viewer, reference: string, reason: string, expectedVersion: number) {
  staff(viewer);
  if (!reason.trim() || reason.trim().length > 500) throw new JobProblem("Enter the reason for revoking access (500 characters or fewer).");
  const db = await getDb();
  await db.transaction(async tx => {
    const [job] = await tx.update(jobs).set({ customerId: null, version: sql`${jobs.version} + 1` }).where(and(eq(jobs.reference, cleanReference(reference)), eq(jobs.version, expectedVersion))).returning({ id: jobs.id });
    if (!job) throw new JobProblem(conflict);
    await tx.update(customerInvitations).set({ cancelledAt: new Date() }).where(and(eq(customerInvitations.jobId, job.id), isNull(customerInvitations.acceptedAt), isNull(customerInvitations.cancelledAt)));
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "staff", kind: "access-revoked", body: reason.trim() });
  });
}

export async function jobNotifications(viewer: Viewer, reference: string) {
  staff(viewer);
  const { job } = await readJob(viewer, reference);
  return (await getDb()).select({ id: notifications.id, kind: notifications.kind, channel: notifications.channel, recipient: notifications.recipient, status: notifications.status,
    attempts: notifications.attempts, lastError: notifications.lastError }).from(notifications)
    .where(or(eq(notifications.jobId, job.id), and(eq(notifications.inquiryId, job.inquiryId), eq(notifications.kind, "request-receipt")))).orderBy(notifications.createdAt);
}

export async function cancelCustomerInvitation(viewer: Viewer, reference: string, id: string, version: number) {
  staff(viewer);
  if (!keyPattern.test(id)) throw new JobProblem("Choose a valid invitation.");
  const db = await getDb();
  await db.transaction(async tx => {
    const [job] = await tx.update(jobs).set({ version: sql`${jobs.version} + 1` }).where(and(eq(jobs.reference, cleanReference(reference)), eq(jobs.version, version))).returning({ id: jobs.id });
    if (!job) throw new JobProblem(conflict);
    await tx.update(customerInvitations).set({ cancelledAt: new Date() }).where(and(eq(customerInvitations.id, id), eq(customerInvitations.jobId, job.id), isNull(customerInvitations.acceptedAt)));
    await tx.update(notifications).set({ status: "cancelled" }).where(and(eq(notifications.eventKey, `job-invite:${id}`), inArray(notifications.status, ["pending", "failed"])));
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "staff", kind: "invitation-cancelled", body: "Pending customer invitation cancelled." });
  });
}
