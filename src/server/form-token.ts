import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

function secret(): string {
  const value = process.env.MIAS_FORM_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("MIAS_FORM_SECRET must be set in production.");
  return "mias-development-only-secret";
}

/** False only in a production build without MIAS_FORM_SECRET: the form then stays off instead of crashing. */
export const formReady = () => Boolean(process.env.MIAS_FORM_SECRET) || process.env.NODE_ENV !== "production";

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

/** Signed "form opened at" time, so submissions sent too quickly can be recognised as automated. */
export function issueFormToken(now = Date.now()): string {
  return `${now}.${sign(String(now))}`;
}

/** Milliseconds since the form was opened, or null when the token is missing or forged. */
export function formTokenAge(token: string, now = Date.now()): number | null {
  const [issued, signature] = token.split(".");
  if (!issued || !signature) return null;
  const expected = Buffer.from(sign(issued)), given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const age = now - Number(issued);
  return Number.isFinite(age) && age >= 0 ? age : null;
}

export const newIdempotencyKey = () => randomUUID();

/** One-way hash of a network address: enough to rate-limit, impossible to turn back into the address. */
export function hashNetworkAddress(address: string): string {
  return createHmac("sha256", secret()).update(`network:${address}`).digest("hex").slice(0, 32);
}
