import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/accounts";
import { pageMetadata } from "@/lib/site-metadata";
import { SignInForm } from "@/components/account-forms";
import { accountsReady } from "@/server/auth";
import { getViewer } from "@/server/session";

export const metadata: Metadata = pageMetadata("Sign in | Mias Energy Solutions", "Sign in to your Mias Energy Solutions account to see your inquiries, or to the company workspace.", "/sign-in");

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  const viewer = await getViewer();
  if (viewer) redirect(viewer.role === "customer" ? "/account" : "/staff");
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Sign in</h1>
    <p>Customers see the inquiries they’ve sent; the Mias team opens the company workspace.</p>
    <div className="account-card">{accountsReady() ? <SignInForm next={safeNextPath(typeof next === "string" ? next : "") ?? ""} /> : <p>Accounts aren’t switched on for this version of the site.</p>}</div>
  </div></main>;
}
