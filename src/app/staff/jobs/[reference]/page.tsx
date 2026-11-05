import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { WorkspaceHeader } from "@/components/workspace-header";
import { CancelCustomerInviteForm, ChatReplyForm, CustomerInviteForm, JobMessageForm, JobWorkflowForm, RetryJobNotificationsForm, RevokeAccessForm } from "@/components/job-forms";
import { JobFiles } from "@/components/job-files";
import { JobDocuments } from "@/components/job-documents";
import { JobHistory } from "@/components/job-history";
import { JobConversation } from "@/components/job-conversation";
import { readConversation } from "@/server/job-conversation";
import { jobStages } from "@/lib/jobs";
import { staffJobDetails, jobNotifications } from "@/server/jobs";
import { requireViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Job | Mias company workspace", robots: { index: false, follow: false } };
const labels: Record<string, string> = { pending: "Queued", sending: "Outcome unknown / sending — review before any resend", sent: "Captured locally", failed: "Failed", cancelled: "Cancelled" };
export default async function StaffJob({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { reference } = await params, viewer = await requireViewer(["staff", "owner"], `/staff/jobs/${reference}`);
  const { job, events, inquiry, people, contacts, pending } = await staffJobDetails(viewer, reference);
  const thread = await readConversation(job.reference, viewer);
  const notices = await jobNotifications(viewer, reference), closed = ["completed", "cancelled"].includes(job.stage);
  const notice = (await searchParams).notice;
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={job.reference} current="jobs" />
    {(notice === "access-revoked" || notice === "invitation-cancelled") && <p role="status" className="form-success">{notice === "access-revoked" ? "Customer access revoked." : "Invitation cancelled."}</p>}
    {notice === "file-removed" && <p role="status" className="form-success">File removed.</p>}
    <p className="account-links"><a href="/staff/jobs">← All jobs</a> · <a href={`/staff/inquiries/${inquiry.reference}`}>Original inquiry: {inquiry.reference}</a></p>
    <div className="job-overview"><p className="eyebrow">{jobStages[job.stage as keyof typeof jobStages]}</p><h2>{job.scope}</h2><p><strong>Next step:</strong> {job.nextStep}</p><p>Responsible staff: {people.find(person => person.id === job.assigneeId)?.name ?? "Inactive staff member"}</p></div>
    <div className="job-columns"><div>
      <JobConversation key={job.reference} initial={thread} endpoint={`/api/jobs/${job.reference}/conversation?portal=staff`}>
        <ChatReplyForm reference={job.reference} eventKey={randomUUID()} />
      </JobConversation>
      <details open className="account-card private-card"><summary>Private staff notes</summary><JobMessageForm reference={job.reference} kind="note" eventKey={randomUUID()} />
        <JobHistory events={events.filter(event => event.kind === "note")} /></details>
      <section className="account-card"><h2>Post a job update</h2><JobMessageForm reference={job.reference} kind="update" eventKey={randomUUID()} /></section>
    </div><div>
      <section className="account-card"><h2>Manage job</h2>{closed ? <p>This job is closed. Its history is retained.</p> : <JobWorkflowForm job={job} people={people} />}</section>
      <section className="account-card"><h2>Customer access</h2>
        {job.company && <p>Company: {job.company}</p>}
        {contacts.map(contact => <div key={contact.id} data-job-contact><p>{contact.name} · {contact.email}</p><RevokeAccessForm reference={job.reference} version={job.version} contactId={contact.id} /></div>)}
        {!contacts.length && <p>No customer has accepted access yet.</p>}
        <CustomerInviteForm reference={job.reference} version={job.version} company={job.company ?? ""} name={contacts.length ? "" : inquiry.name} email={contacts.length ? "" : inquiry.email ?? ""} />
        {pending.map(invite => <div className="job-pending-invite" key={invite.id}><p>Pending: {invite.email} · expires {new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium" }).format(invite.expiresAt)}</p><CancelCustomerInviteForm reference={job.reference} version={job.version} id={invite.id} /></div>)}
      </section>
      <section className="account-card"><h2>Notification delivery</h2><p className="field-hint">Email and SMS are captured on this computer. No real messages are sent.</p>
        <ul className="job-notifications">{notices.map(note => <li key={note.id}><strong>{note.kind === "request-receipt" ? "Receipt" : note.kind === "request-accepted" ? "Acceptance" : "Invitation"} · {note.channel.toUpperCase()}</strong><br />{note.recipient}<br />{labels[note.status] ?? note.status} · {note.attempts} / 4 attempts{note.status === "failed" && note.attempts >= 4 ? " · retries exhausted" : ""}</li>)}</ul>
        <RetryJobNotificationsForm reference={job.reference} />
      </section>
      <section className="account-card"><h2>History</h2><JobHistory events={events.filter(event => event.kind !== "note")} /></section>
    </div></div>
    <JobFiles reference={job.reference} stage={job.stage} viewer={viewer} />
    <JobDocuments reference={job.reference} viewer={viewer} />
  </main>;
}
