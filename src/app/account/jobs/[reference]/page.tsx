import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { JobFiles } from "@/components/job-files";
import { JobDocuments } from "@/components/job-documents";
import { JobSolarPlan } from "@/components/job-solar-plan";
import { JobHistory } from "@/components/job-history";
import { JobConversation } from "@/components/job-conversation";
import { readConversation } from "@/server/job-conversation";
import { ChatReplyForm } from "@/components/job-forms";
import { jobStages } from "@/lib/jobs";
import { readJob } from "@/server/jobs";
import { requireViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your job | Mias Energy Solutions", robots: { index: false, follow: false } };
export default async function CustomerJob({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params, viewer = await requireViewer(["customer", "staff", "owner"], `/account/jobs/${reference}`);
  // This route always renders a customer projection, including when staff inspect it.
  const customer = { ...viewer, role: "customer" as const };
  const { job, events } = await readJob(customer, reference);
  const thread = await readConversation(job.reference, customer);
  return <main id="main-content" className="site-container workspace customer-job" tabIndex={-1}>
    <p className="account-links"><a href="/account">← My account</a></p>
    <header className="job-overview portal-overview">
      <span className="portal-stage">{jobStages[job.stage as keyof typeof jobStages]}</span>
      <h1>{job.scope}</h1>
      <p className="portal-reference">Job reference · {job.reference}</p>
      <div className="portal-next"><strong>Next step</strong><p>{job.nextStep}</p></div>
      <p className="field-hint">Last updated {new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" }).format(job.updatedAt)} (Zambia time)</p>
    </header>
    <nav className="portal-actions" aria-label="Job sections">
      <a className="button button-small" href="#job-message">Message Mias</a>
      <a href="#progress">Progress</a>
      <a href="#documents">Documents</a>
      <a href="#files">Files</a>
    </nav>
    <div className="job-columns"><JobConversation key={job.reference} initial={thread} endpoint={`/api/jobs/${job.reference}/conversation?portal=customer`}>
      <ChatReplyForm reference={job.reference} eventKey={randomUUID()} customer />
    </JobConversation><section className="account-card"><h2 id="progress" tabIndex={-1}>Job progress</h2><JobHistory events={events} /></section></div>
    <JobDocuments reference={job.reference} viewer={customer} />
    <JobFiles reference={job.reference} stage={job.stage} viewer={customer} />
    <JobSolarPlan reference={job.reference} viewer={customer}/>
  </main>;
}
