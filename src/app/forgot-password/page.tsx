import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { ForgotPasswordForm } from "@/components/account-forms";

export const metadata: Metadata = pageMetadata("Reset your password | Mias Energy Solutions", "Ask for a link to reset the password for your Mias Energy Solutions account.", "/forgot-password");

export default function ForgotPassword() {
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Forgot your password?</h1>
    <p>Enter the email address you signed up with and we’ll send a link to choose a new password.</p>
    <div className="account-card"><ForgotPasswordForm /></div>
  </div></main>;
}
