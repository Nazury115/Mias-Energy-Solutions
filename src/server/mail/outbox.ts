import { and, eq, inArray, lt, ne } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { notifications } from "@/server/db/schema";
import { getTransport } from "@/server/mail/transport";

/** Development-only switches (spec 006, DEV-02); always null in production. */
export type Simulation = "db-failure" | "notify-failure" | "email-failure" | null;
export type AccountEmailKind = "verify-email" | "reset-password" | "invitation" | "signup-notice";

const deliveryAttempts = 4;

/** Tries one stored notification and records the result; never throws. */
export async function deliver(id: string, simulate: Simulation = null): Promise<boolean> {
  try {
    const db = await getDb();
    const [note] = await db.select().from(notifications).where(eq(notifications.id, id));
    if (!note || note.channel !== "email") return false;
    if (note.status === "sent") return true;
    if (!["pending", "failed"].includes(note.status) || note.attempts >= deliveryAttempts) return false;
    // One caller claims the row; overlapping retry triggers cannot both send it.
    const claimed = await db.update(notifications).set({ status: "sending", attempts: note.attempts + 1, lastError: null })
      .where(and(eq(notifications.id, id), eq(notifications.status, note.status), eq(notifications.attempts, note.attempts))).returning({ id: notifications.id });
    if (!claimed.length) return false;
    try {
      const activeSimulation = process.env.NODE_ENV === "development" ? simulate : null;
      if (activeSimulation === "notify-failure" || activeSimulation === `${note.channel}-failure`) throw new Error("Simulated notification failure (development switch).");
      await getTransport().send({ to: note.recipient, replyTo: note.replyTo, subject: note.subject, body: note.body, idempotencyKey: note.eventKey ?? note.id });
    } catch {
      await db.update(notifications).set({ status: "failed", lastError: "Delivery failed. Review the channel configuration or retry." }).where(eq(notifications.id, id));
      return false;
    }
    // If recording the result fails, keep 'sending' as an unknown outcome, never blindly resend.
    await db.update(notifications).set({ status: "sent", sentAt: new Date(), lastError: null }).where(eq(notifications.id, id));
    return true;
  } catch { return false; }
}

/** Retries eligible notifications (up to 4 attempts); runs after submissions and when the inbox opens. */
export async function retryPendingNotifications(simulate: Simulation, skipId?: string): Promise<void> {
  const db = await getDb();
  const filters = [eq(notifications.channel, "email"), inArray(notifications.status, ["pending", "failed"]), lt(notifications.attempts, deliveryAttempts)];
  if (skipId) filters.push(ne(notifications.id, skipId));
  const due = await db.select({ id: notifications.id }).from(notifications).where(and(...filters)).orderBy(notifications.createdAt).limit(10);
  for (const { id } of due) await deliver(id, simulate);
}

export async function deliverRows(ids: string[], simulate: Simulation = null) {
  for (const id of ids) await deliver(id, simulate);
}

/** Account emails (confirmation, reset, invitation, sign-up notice) share the outbox with inquiry notifications. */
export async function queueEmail(email: { kind: AccountEmailKind; to: string; subject: string; body: string }): Promise<void> {
  const db = await getDb();
  const [row] = await db.insert(notifications).values({ kind: email.kind, recipient: email.to, subject: email.subject, body: email.body }).returning({ id: notifications.id });
  await deliver(row.id);
}
