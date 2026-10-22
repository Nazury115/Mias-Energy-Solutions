import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/site-metadata";
import { SignUpForm } from "@/components/account-forms";
import { accountsReady } from "@/server/auth";
import { getViewer } from "@/server/session";

export const metadata: Metadata = pageMetadata("Create an account | Mias Energy Solutions", "Create a Mias Energy Solutions account to keep track of the inquiries you send.", "/sign-up");

export default async function SignUp() {
  const viewer = await getViewer();
  if (viewer) redirect(viewer.role === "customer" ? "/account" : "/staff");
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Create an account</h1>
    <p>Keep your inquiries in one place. You don’t need an account to contact Mias.</p>
    <div className="account-card">{accountsReady() ? <SignUpForm /> : <p>Accounts aren’t switched on for this version of the site.</p>}</div>
  </div></main>;
}
