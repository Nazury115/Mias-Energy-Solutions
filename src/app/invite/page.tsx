import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { InvitationForm } from "@/components/account-forms";
import { accountsReady } from "@/server/auth";
import { findInvitation } from "@/server/team";

export const metadata: Metadata = pageMetadata("Join Mias Energy Solutions | Mias", "Accept your invitation to the Mias Energy Solutions company workspace.", "/invite");

const problems: Record<string, string> = {
  used: "This invitation has already been used. Sign in instead, or ask an Owner for a new invitation.",
  expired: "This invitation has expired. Ask an Owner to send a new one.",
  cancelled: "This invitation was cancelled. Ask an Owner if you think this is a mistake.",
};

export default async function Invite({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  const invitation = accountsReady() && typeof token === "string" && token ? await findInvitation(token) : null;
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">COMPANY WORKSPACE</p><h1>Join Mias Energy Solutions</h1>
    {invitation?.state === "valid" && typeof token === "string"
      ? <><p>Welcome, {invitation.name}. You’ve been invited as <strong>{invitation.role === "owner" ? "an Owner" : "Staff"}</strong> using {invitation.email}.</p>
        <div className="account-card"><InvitationForm token={token} /></div></>
      : <div className="account-card"><p role="alert" className="form-alert">{invitation ? problems[invitation.state] : "This invitation link isn’t valid. Check that you copied the whole link."}</p>
        <p className="account-links"><a href="/sign-in">Go to sign in</a></p></div>}
  </div></main>;
}
