import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { JobFiles } from "@/components/job-files";
import { JobDocuments } from "@/components/job-documents";
import { JobSolarPlan } from "@/components/job-solar-plan";
import { JobHistory } from "@/components/job-history";
import { JobConversation } from "@/components/job-conversation";
import { readConversation } from "@/server/job-conversation";
import { JobRefresh } from "@/components/job-refresh";
import { ChatReplyForm, UploadForm } from "@/components/job-forms";
import { jobStages } from "@/lib/jobs";
import { readJob } from "@/server/jobs";
import { requireViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your job | Mias Energy Solutions", robots: { index: false, follow: false } };
const sections = { all: "All", messages: "Messages", files: "Documents & files", progress: "Progress" };
const stages = ["assessment", "awaiting-quotation", "scheduled", "in-progress", "completed"] as const;
export default async function CustomerJob({ params, searchParams }: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { reference } = await params, viewer = await requireViewer(["customer", "staff", "owner"], `/account/jobs/${reference}`);
  // This route always renders a customer projection, including when staff inspect it.
  const customer = { ...viewer, role: "customer" as const };
  const { job, events } = await readJob(customer, reference);
  const { view } = await searchParams;
  const active = typeof view === "string" && Object.hasOwn(sections, view) ? view : "all";
  const shows = (section: string) => active === "all" || active === section;
  const thread = shows("messages") ? await readConversation(job.reference, customer) : [];
  const position = stages.findIndex(stage => stage === job.stage);
  return <main id="main-content" className="site-container workspace customer-job" tabIndex={-1}>
    <p className="account-links"><a href="/account">← My account</a></p>
    <header className="job-overview portal-overview">
      <span className="portal-stage">{jobStages[job.stage as keyof typeof jobStages]}</span>
      <h1>{job.scope}</h1>
      <p className="portal-reference">Job reference · {job.reference}</p>
      <div className="portal-next"><strong>Next step</strong><p>{job.nextStep}</p></div>
      <p className="field-hint">Last updated {new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" }).format(job.updatedAt)} (Zambia time)</p>
    </header>
    <nav className="job-sections" aria-label="Job sections">
      {Object.entries(sections).map(([key, label]) => <a key={key} aria-current={key === active ? "page" : undefined}
        href={key === "all" ? `/account/jobs/${reference}` : `/account/jobs/${reference}?view=${key}`}>{label}</a>)}
    </nav>
    <JobRefresh />
    {shows("progress") && <section className="account-card"><h2 id="progress" tabIndex={-1}>Job progress</h2>
      {position < 0 && <p>Current status: <strong>{jobStages[job.stage as keyof typeof jobStages]}</strong></p>}
      <ol className="job-stages" aria-label="Job stages">{stages.map((stage, i) =>
        <li key={stage} aria-current={stage === job.stage ? "step" : undefined} data-before={i < position}>
          <span aria-hidden="true">{i + 1}</span>{jobStages[stage]}
        </li>)}</ol>
      <h3>Updates</h3><JobHistory events={events.filter(event => ["created", "progress", "update"].includes(event.kind))} />
    </section>}
    {shows("messages") && <JobConversation key={job.reference} initial={thread} endpoint={`/api/jobs/${job.reference}/conversation?portal=customer`}>
      <ChatReplyForm reference={job.reference} eventKey={randomUUID()} customer />
      {!["completed", "cancelled"].includes(job.stage) && <details className="chat-attach"><summary>Attach a photo or file</summary>
        <UploadForm reference={reference} submission={randomUUID()} customer chat />
      </details>}
    </JobConversation>}
    {shows("files") && <>
      <JobDocuments reference={job.reference} viewer={customer} />
      <JobFiles reference={job.reference} stage={job.stage} viewer={customer} />
      <JobSolarPlan reference={job.reference} viewer={customer} />
    </>}
  </main>;
}
