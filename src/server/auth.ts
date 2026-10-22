import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { siteUrl } from "@/lib/site-metadata";
import { getDb } from "@/server/db/client";
import { account, session, user, verification } from "@/server/db/schema";
import { queueEmail } from "@/server/mail/outbox";

/** False only in a production build without BETTER_AUTH_SECRET: sign-in then stays off instead of failing unsafely. */
export const accountsReady = () => Boolean(process.env.BETTER_AUTH_SECRET) || process.env.NODE_ENV !== "production";
const link = (path: string, token: string) => `${siteUrl}${path}?token=${encodeURIComponent(token)}`;

// Better Auth (spec 007, D-1). Its HTTP endpoints are never mounted: every flow goes through our server actions,
// so lockout, wording and role rules can't be bypassed. Emailed links point at our own pages.
async function createAuth() {
  const db = await getDb();
  return betterAuth({
    appName: "Mias Energy Solutions",
    baseURL: siteUrl,
    secret: process.env.BETTER_AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "mias-development-only-auth-secret-0123456789abcdef"),
    database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
    telemetry: { enabled: false },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user: person, token }) => queueEmail({
        kind: "reset-password", to: person.email, subject: "Reset your Mias Energy Solutions password",
        body: [`Hello ${person.name},`, "", "Use this link to choose a new password:", link("/reset-password", token), "",
          "The link works once and expires in 1 hour. If you didn't ask for this, ignore this email; your password stays the same."].join("\n"),
      }),
      onExistingUserSignUp: async ({ user: person }) => queueEmail({
        kind: "signup-notice", to: person.email, subject: "Someone tried to create an account with your email",
        body: [`Hello ${person.name},`, "", "Someone tried to create a Mias Energy Solutions account with this email address, but you already have one.",
          `If it was you, sign in at ${siteUrl}/sign-in or reset your password at ${siteUrl}/forgot-password.`, "If it wasn't you, you can ignore this email."].join("\n"),
      }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: false,
      autoSignInAfterVerification: false,
      expiresIn: 24 * 60 * 60,
      sendVerificationEmail: async ({ user: person, token }) => queueEmail({
        kind: "verify-email", to: person.email, subject: "Confirm your email for Mias Energy Solutions",
        body: [`Hello ${person.name},`, "", "Confirm your email address to finish creating your account:", link("/verify-email", token), "",
          "The link expires in 24 hours. If you didn't create an account, you can ignore this email."].join("\n"),
      }),
    },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "customer", input: false },
        phone: { type: "string", required: false, input: true },
        status: { type: "string", defaultValue: "active", input: false },
      },
    },
    session: { expiresIn: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
    verification: { storeIdentifier: "hashed" },
    databaseHooks: {
      session: {
        create: {
          // Deactivated accounts can never start a session (ROLE-04).
          before: async newSession => {
            const [person] = await db.select({ status: user.status }).from(user).where(eq(user.id, newSession.userId));
            return person?.status === "active" ? undefined : false;
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;
const store = globalThis as typeof globalThis & { miasAuth?: Promise<Auth> };

export function getAuth(): Promise<Auth> {
  store.miasAuth ??= createAuth().catch(error => {
    store.miasAuth = undefined;
    throw error;
  });
  return store.miasAuth;
}
