import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone, replyMethods, type ReplyMethod } from "@/lib/inquiry-submission";
import { siteUrl } from "@/lib/site-metadata";
import { listAccountEmails, listCustomerNotifications, listInbox, retryPendingNotifications, type Simulation } from "@/server/inquiries";
import { createOwnerInvitation, removeInquiry, setSimulation } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Development inbox | Mias", robots: { index: false, follow: false } };

const statusLabels: Record<string, string> = { sent: "Delivered to development inbox", failed: "Delivery failed (bounded retries)", pending: "Waiting to be delivered", sending: "Sending / outcome unknown; review before resending", cancelled: "Cancelled" };
const switches: [Simulation, string][] = [[null, "Normal"], ["notify-failure", "Simulate notification failure"], ["db-failure", "Simulate database failure"], ["email-failure", "Simulate email failure"], ["sms-failure", "Simulate SMS failure"]];

// Development-only view of saved inquiries and the notification emails Mias would receive (spec 006, DEV-01).
const kindLabels: Record<string, string> = { "verify-email": "Email confirmation", "reset-password": "Password reset", invitation: "Invitation", "signup-notice": "Sign-up notice", "job-invitation": "Customer portal invitation" };

export default async function DevelopmentInbox({ searchParams }: { searchParams: Promise<{ "owner-invite"?: string | string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const current = (await cookies()).get("mias-simulate")?.value ?? null;
  const simulate: Simulation = switches.some(([value]) => value === current) ? current as Simulation : null;
  await retryPendingNotifications(simulate).catch(() => undefined);
  const items = await listInbox();
  const accountEmails = await listAccountEmails();
  const customerNotices = await listCustomerNotifications();
  const invite = (await searchParams)["owner-invite"];
  const ownerInvite = typeof invite === "string" && invite.startsWith(`${siteUrl}/invite?token=`) ? invite : null;

  return <main id="main-content" className="site-container dev-inbox" tabIndex={-1}>
    <p className="eyebrow">DEVELOPMENT ONLY · NOT ON THE LIVE SITE</p>
    <h1>Development inbox</h1>
    <p className="lead">Inquiries saved on this computer, and the notification email Mias would receive for each. Nothing here is sent anywhere. Opening this page retries undelivered notifications.</p>
    <section className="dev-switches" aria-label="Failure switches for this browser">
      <p><strong>Failure switch for this browser:</strong> {switches.find(([value]) => value === simulate)?.[1]}</p>
      <div>{switches.map(([value, label]) => <form key={label} action={setSimulation}><input type="hidden" name="simulate" value={value ?? ""} /><button type="submit" className="button button-small button-light" aria-pressed={value === simulate}>{label}</button></form>)}</div>
    </section>
    <section className="dev-switches" aria-labelledby="owner-heading">
      <p id="owner-heading"><strong>Create an Owner invitation (development only)</strong>: the same as <code>pnpm users:create-owner</code>, usable while the website runs.</p>
      <form action={createOwnerInvitation} className="form-grid">
        <div><label htmlFor="owner-name">Owner name</label><input id="owner-name" name="name" required /></div>
        <div><label htmlFor="owner-email">Owner email</label><input id="owner-email" name="email" type="email" required /></div>
        <div><button type="submit" className="button button-small">Create Owner invitation</button></div>
      </form>
      {ownerInvite && <p>Single-use link: <a data-owner-invite href={ownerInvite}>{ownerInvite}</a></p>}
      {invite === "invalid" && <p className="field-error">Enter a name and a valid email address.</p>}
    </section>
    <h2>Inquiries</h2>
    {items.length === 0 && <p className="notice">No inquiries yet. Send one from the <a href="/contact">Contact page</a>.</p>}
    <ol className="dev-inbox-list">{items.map(({ inquiry, notification, jobReference }) => <li key={inquiry.id}>
      <article data-inquiry={inquiry.reference} data-notification-status={notification?.status ?? "none"}>
        <header><strong>{inquiry.reference}</strong><span className={`dev-status dev-status-${notification?.status ?? "none"}`}>{statusLabels[notification?.status ?? ""] ?? "No notification"}{notification ? ` · ${notification.attempts} attempt${notification.attempts === 1 ? "" : "s"}` : ""}</span></header>
        <dl>
          <div><dt>Received</dt><dd>{new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" }).format(inquiry.createdAt)}</dd></div>
          <div><dt>Name</dt><dd>{inquiry.name}</dd></div>
          <div><dt>Phone</dt><dd>{inquiry.phone ? displayPhone(inquiry.phone) : "—"}</dd></div>
          <div><dt>Email</dt><dd>{inquiry.email ?? "—"}</dd></div>
          <div><dt>Reply by</dt><dd>{replyMethods[inquiry.preferredReply as ReplyMethod]}</dd></div>
          <div><dt>Service</dt><dd>{inquiryServices[inquiry.service as keyof typeof inquiryServices]}</dd></div>
          <div><dt>Area</dt><dd>{inquiry.area ?? "—"}</dd></div>
        </dl>
        <p className="dev-message">{inquiry.message}</p>
        {notification && <details><summary>Notification email</summary><pre>{`To: ${notification.recipient}\nReply-To: ${notification.replyTo ?? "(none)"}\nSubject: ${notification.subject}\n\n${notification.body}`}</pre>{notification.lastError && <p className="field-error">Last error: {notification.lastError}</p>}</details>}
        {jobReference ? <p>This inquiry belongs to <a href={`/staff/jobs/${jobReference}`}>{jobReference}</a> and is retained with its job.</p> : <form action={removeInquiry}><input type="hidden" name="reference" value={inquiry.reference} /><button type="submit" className="text-button">Delete this inquiry</button></form>}
      </article>
    </li>)}</ol>
    <h2 className="spaced">Customer email and SMS notifications</h2>
    <p>Local captures only. Opening this inbox retries eligible failed messages up to four attempts. An unknown outcome is not retried automatically.</p>
    <ol className="dev-inbox-list">{customerNotices.map(note => <li key={note.id}><article data-notification-kind={note.kind} data-channel={note.channel} data-delivery-status={note.status} data-attempts={note.attempts}>
      <header><strong>{note.kind === "request-receipt" ? "Request receipt" : "Request acceptance"} · {note.channel.toUpperCase()}</strong><span>{statusLabels[note.status] ?? note.status} · {note.attempts} attempts{note.attempts >= 4 && note.status === "failed" ? " · retries exhausted" : ""}</span></header>
      <p className="dev-message">To: {note.recipient}</p><p className="dev-message">{note.body}</p>
    </article></li>)}</ol>
    <h2 className="spaced">Account emails</h2>
    {accountEmails.length === 0 && <p className="notice">No account emails yet.</p>}
    <ol className="dev-inbox-list">{accountEmails.map(email => {
      const link = email.body.match(/https?:\/\/\S+/)?.[0];
      return <li key={email.id}><article data-email-kind={email.kind} data-email-to={email.recipient}>
        <header><strong>{kindLabels[email.kind] ?? email.kind}: {email.subject}</strong><span className={`dev-status dev-status-${email.status}`}>{statusLabels[email.status] ?? email.status}</span></header>
        <p className="dev-message">To: {email.recipient}</p>
        {link && <p className="dev-message">Link: <a data-email-link href={link}>{link}</a></p>}
        <details><summary>Full email</summary><pre>{email.body}</pre></details>
      </article></li>;
    })}</ol>
  </main>;
}
