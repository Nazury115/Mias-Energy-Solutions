import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { sessionTooOld, type Role } from "@/lib/accounts";
import { accountsReady, getAuth } from "@/server/auth";
import { getDb } from "@/server/db/client";
import { session as sessions } from "@/server/db/schema";

export type Viewer = { id: string; name: string; email: string; phone: string | null; role: Role };

/** The signed-in person, or null. Deactivated accounts and staff sessions older than 12 hours are signed out here. */
export async function getViewer(): Promise<Viewer | null> {
  if (!accountsReady()) return null;
  const auth = await getAuth();
  const current = await auth.api.getSession({ headers: await headers() });
  if (!current) return null;
  const { user, session } = current;
  const inactive = user.status !== "active";
  if (inactive || sessionTooOld(user.role, new Date(session.createdAt).getTime(), Date.now())) {
    const db = await getDb();
    await db.delete(sessions).where(inactive ? eq(sessions.userId, user.id) : eq(sessions.id, session.id));
    return null;
  }
  return { id: user.id, name: user.name, email: user.email, phone: user.phone ?? null, role: user.role as Role };
}

/** Server-side gate for every protected page and action (ROLE-02): sign in first, then the role must be allowed. */
export async function requireViewer(allowed: readonly Role[], returnTo: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  if (!allowed.includes(viewer.role)) forbidden();
  return viewer;
}
