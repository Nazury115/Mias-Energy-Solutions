import type { Metadata } from "next";
import { headers } from "next/headers";
import { pageMetadata } from "@/lib/site-metadata";
import { accountsReady, getAuth } from "@/server/auth";

export const metadata: Metadata = pageMetadata("Confirm your email | Mias Energy Solutions", "Confirm the email address for your Mias Energy Solutions account.", "/verify-email");

// Confirms only; it never signs anyone in, so a forwarded or reused link grants nothing (spec 007, AUTH-02).
export default async function VerifyEmail({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  let confirmed = false;
  if (accountsReady() && typeof token === "string" && token) {
    try {
      await (await getAuth()).api.verifyEmail({ query: { token }, headers: await headers() });
      confirmed = true;
    } catch {
      confirmed = false;
    }
  }
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">YOUR ACCOUNT</p>
    {confirmed
      ? <><h1>Email confirmed</h1><p>Thank you. Your account is ready.</p><a className="button" href="/sign-in">Sign in <span aria-hidden="true">↗</span></a></>
      : <><h1>This confirmation link isn’t valid</h1><p>It may have expired (links last 24 hours) or been copied incompletely. Sign in and we’ll offer to send a new one.</p><a className="button" href="/sign-in">Go to sign in <span aria-hidden="true">↗</span></a></>}
  </div></main>;
}
