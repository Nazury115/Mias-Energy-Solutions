import { and, eq, inArray, lt, ne } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { notifications } from "@/server/db/schema";
import { getTransport } from "@/server/mail/transport";

/** Development-only switches (spec 006, DEV-02); always null in production. */
export type Simulation = "db-failure" | "notify-failure" | null;
export type AccountEmailKind = "verify-email" | "reset-password" | "invitation" | "signup-notice";

const deliveryAttempts = 4;

/** Tries to deliver one stored email and records the result; never throws. */
export async function deliver(id: string, simulate: Simulation = null): Promise<boolean> {
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

/** Retries undelivered emails (up to 4 attempts each); runs after submissions and when the inbox opens. */
export async function retryPendingNotifications(simulate: Simulation, skipId?: string): Promise<void> {
  const db = await getDb();
  const filters = [inArray(notifications.status, ["pending", "failed"]), lt(notifications.attempts, deliveryAttempts)];
  if (skipId) filters.push(ne(notifications.id, skipId));
  const due = await db.select({ id: notifications.id }).from(notifications).where(and(...filters)).orderBy(notifications.createdAt).limit(10);
  for (const { id } of due) await deliver(id, simulate);
}

/** Account emails (confirmation, reset, invitation, sign-up notice) share the outbox with inquiry notifications. */
export async function queueEmail(email: { kind: AccountEmailKind; to: string; subject: string; body: string }): Promise<void> {
  const db = await getDb();
  const [row] = await db.insert(notifications).values({ kind: email.kind, recipient: email.to, subject: email.subject, body: email.body }).returning({ id: notifications.id });
  await deliver(row.id);
}
