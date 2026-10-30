import type { Metadata } from "next";
import { WorkspaceHeader } from "@/components/workspace-header";
import { jobStages } from "@/lib/jobs";
import { listJobs } from "@/server/jobs";
import { requireViewer } from "@/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Jobs | Mias company workspace", robots: { index: false, follow: false } };
export default async function StaffJobs({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string }> }) {
  const viewer = await requireViewer(["staff", "owner"], "/staff/jobs"), params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "", stage = typeof params.stage === "string" ? params.stage : "";
  const rows = await listJobs(viewer, query, stage);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Jobs" current="jobs" />
    <form action="/staff/jobs" className="search-bar" role="search"><div><label htmlFor="job-search">Search jobs</label><input id="job-search" name="q" defaultValue={query} placeholder="Reference or agreed work" /></div>
      <div><label htmlFor="filter-stage">Job stage</label><select id="filter-stage" name="stage" defaultValue={stage}><option value="">All stages</option>{Object.entries(jobStages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><button className="button button-small">Search</button></form>
    <p className="muted">{rows.length} job{rows.length === 1 ? "" : "s"}, most recently updated first.</p>
    {rows.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Reference</th><th>Agreed work</th><th>Stage</th><th>Next step</th></tr></thead><tbody>{rows.map(job => <tr key={job.reference}>
      <td><a href={`/staff/jobs/${job.reference}`}>{job.reference}</a></td><td>{job.scope}</td><td>{jobStages[job.stage as keyof typeof jobStages]}</td><td>{job.nextStep}</td>
    </tr>)}</tbody></table></div> : <p className="notice">No matching jobs. Accept a reviewed inquiry to create a job.</p>}
  </main>;
}
