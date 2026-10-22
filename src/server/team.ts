import { createHash, randomBytes } from "node:crypto";
import { and, count, desc, eq, inArray, isNull, gt, max } from "drizzle-orm";
import { invitationState, ownerChangeProblem, passwordProblem, type Role } from "@/lib/accounts";
import { siteUrl } from "@/lib/site-metadata";
import { getAuth } from "@/server/auth";
import { getDb } from "@/server/db/client";
import { auditLog, invitations, session, user } from "@/server/db/schema";
import { queueEmail } from "@/server/mail/outbox";

const INVITATION_DAYS = 7;
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const roleNames: Record<string, string> = { owner: "Owner", staff: "Staff", customer: "Customer" };

async function audit(actorId: string | null, action: string, targetUserId: string | null, detail: string) {
  const db = await getDb();
  await db.insert(auditLog).values({ actorId, action, targetUserId, detail });
}

/** Creates a single-use invitation (token stored only as a hash) and emails its link (INV-01). */
export async function createInvitation(details: { name: string; email: string; role: "staff" | "owner"; invitedBy: { id: string; name: string } | null }) {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITATION_DAYS * 86_400_000);
  const email = details.email.trim().toLowerCase();
  await db.insert(invitations).values({ email, name: details.name.trim(), role: details.role, tokenHash: hashToken(token), invitedBy: details.invitedBy?.id ?? null, expiresAt });
  const url = `${siteUrl}/invite?token=${encodeURIComponent(token)}`;
  await queueEmail({
    kind: "invitation", to: email, subject: "You're invited to Mias Energy Solutions",
    body: [`Hello ${details.name.trim()},`, "", `${details.invitedBy?.name ?? "Mias Energy Solutions"} invited you to join Mias Energy Solutions as ${roleNames[details.role]}.`,
      "Choose your password here:", url, "", `The invitation works once and expires in ${INVITATION_DAYS} days.`].join("\n"),
  });
  await audit(details.invitedBy?.id ?? null, "invitation.created", null, `${roleNames[details.role]} invitation for ${email}`);
  return url;
}

export async function findInvitation(token: string) {
  const db = await getDb();
  const [row] = await db.select().from(invitations).where(eq(invitations.tokenHash, hashToken(token)));
  return row ? { ...row, state: invitationState(row) } : null;
}

/** Accepts an invitation: claims it first so it can only ever be used once, then creates the account (INV-02). */
export async function acceptInvitation(token: string, password: string): Promise<{ ok: true; email: string } | { ok: false; problem: string }> {
  const invitation = await findInvitation(token);
  if (!invitation || invitation.state !== "valid") return { ok: false, problem: invitation ? invitation.state : "invalid" };
  const weak = passwordProblem(password, { email: invitation.email, name: invitation.name });
  if (weak) return { ok: false, problem: weak };

  const db = await getDb();
  const claimed = await db.update(invitations).set({ acceptedAt: new Date() })
    .where(and(eq(invitations.id, invitation.id), isNull(invitations.acceptedAt), isNull(invitations.cancelledAt), gt(invitations.expiresAt, new Date())))
    .returning({ id: invitations.id });
  if (!claimed.length) return { ok: false, problem: "used" };

  try {
    const context = await (await getAuth()).$context;
    if (await context.internalAdapter.findUserByEmail(invitation.email)) {
      await db.update(invitations).set({ acceptedAt: null }).where(eq(invitations.id, invitation.id));
      return { ok: false, problem: "An account with this email already exists. Ask an Owner to change its role instead." };
    }
    const created = await context.internalAdapter.createUser({ email: invitation.email, name: invitation.name, emailVerified: true, role: invitation.role, status: "active" }, { method: "email-password" });
    await context.internalAdapter.linkAccount({ userId: created.id, providerId: "credential", accountId: created.id, password: await context.password.hash(password) });
    await audit(created.id, "invitation.accepted", created.id, `${invitation.email} joined as ${roleNames[invitation.role]}`);
    return { ok: true, email: invitation.email };
  } catch (error) {
    await db.update(invitations).set({ acceptedAt: null }).where(eq(invitations.id, invitation.id));
    throw error;
  }
}

export async function cancelInvitation(actorId: string, invitationId: string) {
  const db = await getDb();
  const [row] = await db.update(invitations).set({ cancelledAt: new Date() })
    .where(and(eq(invitations.id, invitationId), isNull(invitations.acceptedAt), isNull(invitations.cancelledAt))).returning({ email: invitations.email });
  if (row) await audit(actorId, "invitation.cancelled", null, `Invitation for ${row.email} cancelled`);
}

/** Staff and Owners with their last sign-in, pending invitations, and recent changes (INV-03). */
export async function teamOverview() {
  const db = await getDb();
  const lastSignIn = db.select({ userId: session.userId, at: max(session.createdAt).as("at") }).from(session).groupBy(session.userId).as("last_sign_in");
  const people = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, lastSignIn: lastSignIn.at })
    .from(user).leftJoin(lastSignIn, eq(lastSignIn.userId, user.id)).where(inArray(user.role, ["owner", "staff"])).orderBy(user.name);
  const pending = (await db.select().from(invitations).where(and(isNull(invitations.acceptedAt), isNull(invitations.cancelledAt))).orderBy(desc(invitations.createdAt)))
    .filter(invitation => invitationState(invitation) === "valid");
  const changes = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(15);
  return { people, pending, changes };
}

/** Role or status change by an Owner, refusing to remove the last active Owner (ROLE-04). */
export async function changePerson(actor: { id: string }, targetId: string, change: { role?: Role; status?: "active" | "deactivated" }): Promise<string | null> {
  const db = await getDb();
  const [target] = await db.select().from(user).where(eq(user.id, targetId));
  if (!target) return "That person no longer exists.";
  const [{ value: activeOwners }] = await db.select({ value: count() }).from(user).where(and(eq(user.role, "owner"), eq(user.status, "active")));
  const problem = ownerChangeProblem({ activeOwners, targetRole: target.role, targetStatus: target.status, newRole: change.role, newStatus: change.status });
  if (problem) return problem;
  await db.update(user).set({ ...change, updatedAt: new Date() }).where(eq(user.id, targetId));
  if (change.status === "deactivated") await db.delete(session).where(eq(session.userId, targetId));
  const what = change.role ? `role → ${roleNames[change.role]}` : `status → ${change.status}`;
  await audit(actor.id, change.role ? "person.role" : "person.status", targetId, `${target.email}: ${what}`);
  return null;
}
