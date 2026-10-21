import { randomInt } from "node:crypto";
import { and, count, desc, eq, gt, inArray, lt, ne, or, type SQL } from "drizzle-orm";
import { business } from "@/content/site";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone, formatReference, replyMethods, validateInquirySubmission, type InquirySubmission, type InquirySubmissionErrors, type InquirySubmissionInput, type ReplyMethod } from "@/lib/inquiry-submission";
import { getDb, type Database } from "@/server/db/client";
import { inquiries, notifications } from "@/server/db/schema";
import { formTokenAge, hashNetworkAddress } from "@/server/form-token";
import { getTransport } from "@/server/mail/transport";

/** Development-only switches (spec 006, DEV-02); always null in production. */
export type Simulation = "db-failure" | "notify-failure" | null;
export type Receipt = { reference: string; name: string; preferredReply: ReplyMethod; contact: string };
export type SubmissionOutcome =
  | ({ status: "received" | "saved-unnotified" } & Receipt)
  | { status: "invalid"; errors: InquirySubmissionErrors }
  | { status: "rate-limited" | "not-saved" };

const setting = (name: string, fallback: number) => Number(process.env[name] ?? fallback);
const limits = () => ({
  minFillMs: setting("MIAS_MIN_FILL_MS", 3000),
  perNetworkHourly: setting("MIAS_LIMIT_PER_NETWORK_HOURLY", 5),
  perContactDaily: setting("MIAS_LIMIT_PER_CONTACT_DAILY", 3),
  deliveryAttempts: 4,
});
const recipient = () => process.env.MIAS_INQUIRY_RECIPIENT ?? business.contacts.email;
const newReference = () => formatReference(new Date().getFullYear(), Array.from({ length: 5 }, () => randomInt(32)));
const contactFor = (inquiry: Pick<InquirySubmission, "preferredReply" | "phone" | "email">) => (inquiry.preferredReply === "email" ? inquiry.email : inquiry.phone && displayPhone(inquiry.phone)) ?? "";
const isUniqueViolation = (error: unknown) => (error as { code?: string; cause?: { code?: string } })?.code === "23505" || (error as { cause?: { code?: string } })?.cause?.code === "23505";

export async function submitInquiry(
  form: { fields: InquirySubmissionInput; honeypot: string; formToken: string; idempotencyKey: string; sourcePath: string },
  context: { networkAddress: string; simulate: Simulation },
): Promise<SubmissionOutcome> {
  const checked = validateInquirySubmission(form.fields);
  if (!checked.ok) return { status: "invalid", errors: checked.errors };
  const inquiry = checked.value;

  // Automated submissions look accepted but are never saved or delivered (SPAM-01, SPAM-03).
  const age = formTokenAge(form.formToken);
  const automated = form.honeypot.trim() !== "" || age === null || age < limits().minFillMs || !/^[0-9a-f-]{36}$/.test(form.idempotencyKey);
  if (automated) return { status: "received", reference: newReference(), name: inquiry.name, preferredReply: inquiry.preferredReply, contact: contactFor(inquiry) };

  let saved: { reference: string; notificationId: string };
  try {
    if (context.simulate === "db-failure") throw new Error("Simulated database failure (development switch).");
    const db = await getDb();
    const existing = await findByKey(db, form.idempotencyKey);
    if (existing) return existing;
    if (await isRateLimited(db, inquiry, hashNetworkAddress(context.networkAddress))) return { status: "rate-limited" };
    try {
      saved = await save(db, inquiry, form.idempotencyKey, form.sourcePath, hashNetworkAddress(context.networkAddress));
    } catch (error) {
      // The same form sent twice at once: the first one won, so answer with its reference (REQ-03).
      const winner = isUniqueViolation(error) ? await findByKey(db, form.idempotencyKey) : null;
      if (winner) return winner;
      throw error;
    }
  } catch (error) {
    console.error(`Inquiry not saved: ${(error as Error).message}`); // never log the visitor's details
    return { status: "not-saved" };
  }

  const delivered = await deliver(saved.notificationId, context.simulate);
  await retryPendingNotifications(context.simulate, saved.notificationId).catch(() => undefined);
  return { status: delivered ? "received" : "saved-unnotified", reference: saved.reference, name: inquiry.name, preferredReply: inquiry.preferredReply, contact: contactFor(inquiry) };
}

async function findByKey(db: Database, key: string): Promise<SubmissionOutcome | null> {
  const [row] = await db.select({ inquiry: inquiries, status: notifications.status }).from(inquiries)
    .leftJoin(notifications, eq(notifications.inquiryId, inquiries.id)).where(eq(inquiries.idempotencyKey, key)).limit(1);
  if (!row) return null;
  const { inquiry } = row, preferredReply = inquiry.preferredReply as ReplyMethod;
  return { status: row.status === "sent" ? "received" : "saved-unnotified", reference: inquiry.reference, name: inquiry.name, preferredReply, contact: contactFor({ ...inquiry, preferredReply }) };
}

async function isRateLimited(db: Database, inquiry: InquirySubmission, networkHash: string): Promise<boolean> {
  const { perNetworkHourly, perContactDaily } = limits();
  const hourAgo = new Date(Date.now() - 3_600_000), dayAgo = new Date(Date.now() - 86_400_000);
  const [{ value: fromNetwork }] = await db.select({ value: count() }).from(inquiries).where(and(eq(inquiries.networkHash, networkHash), gt(inquiries.createdAt, hourAgo)));
  if (fromNetwork >= perNetworkHourly) return true;
  const sameContact: SQL[] = [];
  if (inquiry.phone) sameContact.push(eq(inquiries.phone, inquiry.phone));
  if (inquiry.email) sameContact.push(eq(inquiries.email, inquiry.email));
  const [{ value: fromContact }] = await db.select({ value: count() }).from(inquiries).where(and(or(...sameContact), gt(inquiries.createdAt, dayAgo)));
  return fromContact >= perContactDaily;
}

async function save(db: Database, inquiry: InquirySubmission, idempotencyKey: string, sourcePath: string, networkHash: string) {
  for (let attempt = 0; ; attempt++) {
    const reference = newReference();
    try {
      return await db.transaction(async tx => {
        const [row] = await tx.insert(inquiries).values({ ...inquiry, reference, idempotencyKey, sourcePath, networkHash }).returning({ id: inquiries.id, createdAt: inquiries.createdAt });
        const [note] = await tx.insert(notifications).values({ inquiryId: row.id, recipient: recipient(), replyTo: inquiry.email, ...notificationText(inquiry, reference, row.createdAt, sourcePath) }).returning({ id: notifications.id });
        return { reference, notificationId: note.id };
      });
    } catch (error) {
      // A clash on the random reference is retried; a clash on the idempotency key is handled by the caller.
      if (!isUniqueViolation(error) || attempt >= 2 || (await db.select({ id: inquiries.id }).from(inquiries).where(eq(inquiries.idempotencyKey, idempotencyKey))).length) throw error;
    }
  }
}

// Plain text only. Visitor input never goes into headers; the subject uses the reference and a fixed service label (DLV-01).
function notificationText(inquiry: InquirySubmission, reference: string, createdAt: Date, sourcePath: string) {
  const service = inquiryServices[inquiry.service as keyof typeof inquiryServices];
  const received = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" }).format(createdAt);
  const lines = [
    "New inquiry from the Mias Energy Solutions website", "",
    `Reference: ${reference}`, `Received: ${received} (Zambia time)`, `Name: ${inquiry.name}`,
    `Phone: ${inquiry.phone ?? "not given"}`, `Email: ${inquiry.email ?? "not given"}`,
    `Preferred reply: ${replyMethods[inquiry.preferredReply]}`, `Service: ${service}`, `Project area: ${inquiry.area ?? "not given"}`,
    `Sent from: ${sourcePath}`, "", "Project details:", inquiry.message,
  ];
  return { subject: `New inquiry ${reference}: ${service}`, body: lines.join("\n") };
}

async function deliver(id: string, simulate: Simulation): Promise<boolean> {
  const db = await getDb();
  const [note] = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!note) return false;
  try {
    if (simulate === "notify-failure") throw new Error("Simulated notification failure (development switch).");
    await getTransport().send({ to: note.recipient, replyTo: note.replyTo, subject: note.subject, body: note.body });
    await db.update(notifications).set({ status: "sent", attempts: note.attempts + 1, sentAt: new Date(), lastError: null }).where(eq(notifications.id, id));
    return true;
  } catch (error) {
    await db.update(notifications).set({ status: "failed", attempts: note.attempts + 1, lastError: (error as Error).message.slice(0, 300) }).where(eq(notifications.id, id));
    return false;
  }
}

/** Retries undelivered notifications (up to 4 attempts each); runs after submissions and when the inbox opens. */
export async function retryPendingNotifications(simulate: Simulation, skipId?: string): Promise<void> {
  const db = await getDb();
  const filters = [inArray(notifications.status, ["pending", "failed"]), lt(notifications.attempts, limits().deliveryAttempts)];
  if (skipId) filters.push(ne(notifications.id, skipId));
  const due = await db.select({ id: notifications.id }).from(notifications).where(and(...filters)).orderBy(notifications.createdAt).limit(10);
  for (const { id } of due) await deliver(id, simulate);
}

export async function listInbox(limit = 50) {
  const db = await getDb();
  return db.select({ inquiry: inquiries, notification: notifications }).from(inquiries)
    .leftJoin(notifications, eq(notifications.inquiryId, inquiries.id)).orderBy(desc(inquiries.createdAt)).limit(limit);
}

/** Deletes an inquiry and its notifications (PRIV-03). Returns whether anything was deleted. */
export async function deleteInquiry(reference: string): Promise<boolean> {
  const db = await getDb();
  const removed = await db.delete(inquiries).where(eq(inquiries.reference, reference.trim().toUpperCase())).returning({ id: inquiries.id });
  return removed.length > 0;
}
