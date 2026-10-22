import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { ResetPasswordForm } from "@/components/account-forms";

export const metadata: Metadata = pageMetadata("Choose a new password | Mias Energy Solutions", "Choose a new password for your Mias Energy Solutions account.", "/reset-password");

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Choose a new password</h1>
    <p>Setting a new password signs you out on every other device.</p>
    <div className="account-card">{typeof token === "string" && token
      ? <ResetPasswordForm token={token} />
      : <p>This reset link isn’t valid or has expired. <a href="/forgot-password">Ask for a new one</a>.</p>}</div>
  </div></main>;
}
