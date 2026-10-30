import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { JobHistory } from "@/components/job-history";
import { JobMessageForm } from "@/components/job-forms";
import { jobStages } from "@/lib/jobs";
import { readJob } from "@/server/jobs";
import { requireViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your job | Mias Energy Solutions", robots: { index: false, follow: false } };
export default async function CustomerJob({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params, viewer = await requireViewer(["customer", "staff", "owner"], `/account/jobs/${reference}`);
  // This route always renders a customer projection, including when staff inspect it.
  const { job, events } = await readJob({ ...viewer, role: "customer" }, reference);
  return <main id="main-content" className="site-container workspace customer-job" tabIndex={-1}>
    <p className="account-links"><a href="/account">← My account</a></p><p className="eyebrow">YOUR JOB · {jobStages[job.stage as keyof typeof jobStages]}</p><h1>{job.reference}</h1>
    <div className="job-overview"><h2>{job.scope}</h2><p><strong>Next step:</strong> {job.nextStep}</p><p className="field-hint">Last updated {new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" }).format(job.updatedAt)} (Zambia time)</p></div>
    <div className="job-columns"><section className="account-card"><h2>Progress and messages</h2><JobHistory events={events} /></section>
      <section className="account-card"><h2>Contact the Mias team</h2><JobMessageForm reference={job.reference} kind="message" eventKey={randomUUID()} customer /></section></div>
  </main>;
}
