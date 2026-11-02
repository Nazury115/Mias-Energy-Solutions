import type { Metadata } from "next";
import { AcceptJobInvitationForm } from "@/components/job-forms";
import { accountsReady } from "@/server/auth";
import { findCustomerInvitation } from "@/server/jobs";
import { getViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set up job access | Mias Energy Solutions", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function JobInvite({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams, safeToken = typeof token === "string" ? token.slice(0, 100) : "";
  const invite = accountsReady() ? await findCustomerInvitation(safeToken) : null, viewer = await getViewer();
  const message = !invite ? "This invitation is not valid. Check the link or contact Mias." : invite.state === "used" ? "This invitation has already been used. Sign in to see your job." : invite.state === "expired" ? "This invitation has expired. Ask Mias for a new link." : "This invitation was cancelled. Contact Mias for help.";
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell"><p className="eyebrow">CUSTOMER PORTAL</p><h1>Set up job access</h1><div className="account-card">
    {invite?.state === "valid" ? <><p>Hello {invite.name}. This invitation is for <strong>{invite.email}</strong>. Accept to see existing and future customer-visible progress, messages and shared files for job {invite.reference}.</p>
      {viewer ? viewer.email.toLowerCase() === invite.email ? <AcceptJobInvitationForm token={safeToken} existing /> : <p role="alert" className="form-alert">Sign out, then sign in with the email address this invitation was sent to.</p>
        : <><p className="account-links"><a href={`/sign-in?next=${encodeURIComponent(`/job-invite?token=${safeToken}`)}`}>Sign in to accept</a> if you already have an account. Otherwise choose a password below.</p><AcceptJobInvitationForm token={safeToken} /></>}
    </> : <><p className="form-alert" role="alert">{message}</p><a href="/sign-in">Sign in</a></>}
  </div></div></main>;
}
