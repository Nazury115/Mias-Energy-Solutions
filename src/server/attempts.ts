import { and, count, gt, inArray, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { authAttempts } from "@/server/db/schema";

export type AttemptKind = "sign-in-failure" | "reset-request" | "verification-request";

/** True when any of the keys (an account and/or a hashed network address) has reached the limit in the window. */
export async function tooManyAttempts(kind: AttemptKind, keys: string[], limit: number, windowMs: number): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - windowMs);
  const rows = await db.select({ key: authAttempts.key, value: count() }).from(authAttempts)
    .where(and(eq(authAttempts.kind, kind), inArray(authAttempts.key, keys), gt(authAttempts.createdAt, since))).groupBy(authAttempts.key);
  return rows.some(row => row.value >= limit);
}

export async function recordAttempt(kind: AttemptKind, keys: string[]): Promise<void> {
  const db = await getDb();
  await db.insert(authAttempts).values(keys.map(key => ({ kind, key })));
}
