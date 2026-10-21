import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone, replyMethods, type ReplyMethod } from "@/lib/inquiry-submission";
import { listInbox, retryPendingNotifications, type Simulation } from "@/server/inquiries";
import { removeInquiry, setSimulation } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Development inbox | Mias", robots: { index: false, follow: false } };

const statusLabels: Record<string, string> = { sent: "Delivered to development inbox", failed: "Delivery failed (will retry)", pending: "Waiting to be delivered" };
const switches: [Simulation, string][] = [[null, "Normal"], ["notify-failure", "Simulate notification failure"], ["db-failure", "Simulate database failure"]];

// Development-only view of saved inquiries and the notification emails Mias would receive (spec 006, DEV-01).
export default async function DevelopmentInbox() {
  if (process.env.NODE_ENV !== "development") notFound();
  const current = (await cookies()).get("mias-simulate")?.value ?? null;
  const simulate: Simulation = current === "db-failure" || current === "notify-failure" ? current : null;
  await retryPendingNotifications(simulate).catch(() => undefined);
  const items = await listInbox();

  return <main id="main-content" className="site-container dev-inbox" tabIndex={-1}>
    <p className="eyebrow">DEVELOPMENT ONLY · NOT ON THE LIVE SITE</p>
    <h1>Development inbox</h1>
    <p className="lead">Inquiries saved on this computer, and the notification email Mias would receive for each. Nothing here is sent anywhere. Opening this page retries undelivered notifications.</p>
    <section className="dev-switches" aria-label="Failure switches for this browser">
      <p><strong>Failure switch for this browser:</strong> {switches.find(([value]) => value === simulate)?.[1]}</p>
      <div>{switches.map(([value, label]) => <form key={label} action={setSimulation}><input type="hidden" name="simulate" value={value ?? ""} /><button type="submit" className="button button-small button-light" aria-pressed={value === simulate}>{label}</button></form>)}</div>
    </section>
    {items.length === 0 && <p className="notice">No inquiries yet. Send one from the <a href="/contact">Contact page</a>.</p>}
    <ol className="dev-inbox-list">{items.map(({ inquiry, notification }) => <li key={inquiry.id}>
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
        <form action={removeInquiry}><input type="hidden" name="reference" value={inquiry.reference} /><button type="submit" className="text-button">Delete this inquiry</button></form>
      </article>
    </li>)}</ol>
  </main>;
}
