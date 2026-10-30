import type { Metadata } from "next";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone } from "@/lib/inquiry-submission";
import { pageMetadata } from "@/lib/site-metadata";
import { ProfileForm } from "@/components/account-forms";
import { inquiriesForUser } from "@/server/inquiries";
import { requireViewer } from "@/server/session";
import { listJobs } from "@/server/jobs";
import { jobStages } from "@/lib/jobs";
import { signOut } from "./actions";

// Signed-in content must never be pre-rendered at build time (found in production verification, 007).
export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata("My account | Mias Energy Solutions", "Your Mias Energy Solutions account details and the inquiries you’ve sent.", "/account");
const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium" });

export default async function Account() {
  const viewer = await requireViewer(["customer", "staff", "owner"], "/account");
  const sent = await inquiriesForUser(viewer.id);
  const ownJobs = await listJobs({ ...viewer, role: "customer" });
  return <main id="main-content" className="account-page" tabIndex={-1}><div className="account-shell">
    <p className="eyebrow">MY ACCOUNT</p><h1>My account</h1>
    <p>Signed in as <strong>{viewer.name}</strong> ({viewer.email}){viewer.phone ? ` · ${displayPhone(viewer.phone)}` : ""}.</p>
    {viewer.role !== "customer" && <p><a className="inline-link" href="/staff">Go to the company workspace</a></p>}

    <section className="account-card" aria-labelledby="details-heading"><h2 id="details-heading">Your details</h2>
      <ProfileForm name={viewer.name} phone={viewer.phone ? displayPhone(viewer.phone) : ""} /></section>

    <section className="account-card" aria-labelledby="jobs-heading"><h2 id="jobs-heading">Your jobs</h2>
      {ownJobs.length ? <ul className="account-jobs">{ownJobs.map(job => <li key={job.reference}><a href={`/account/jobs/${job.reference}`}>{job.reference}</a><strong>{job.scope}</strong><span>{jobStages[job.stage as keyof typeof jobStages]}</span><p>Next step: {job.nextStep}</p></li>)}</ul>
        : <p className="muted">No jobs linked yet. After Mias accepts your request, the team can invite you to view your job here.</p>}
    </section>

    <section className="account-card" aria-labelledby="inquiries-heading"><h2 id="inquiries-heading">Your inquiries</h2>
      {sent.length
        ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Reference</th><th>Service</th><th>Sent</th></tr></thead>
          <tbody>{sent.map(item => <tr key={item.reference}><td><strong>{item.reference}</strong></td><td>{inquiryServices[item.service as keyof typeof inquiryServices]}</td><td>{date.format(item.createdAt)}</td></tr>)}</tbody></table></div>
        : <p className="muted">None yet. <a className="inline-link" href="/contact">Send an inquiry</a> while signed in and it will appear here.</p>}
      <p className="field-hint">Inquiries sent before you created an account aren’t listed. Mias can link them for you.</p>
    </section>

    <form action={signOut} className="account-links"><button className="button button-light" type="submit">Sign out</button></form>
  </div></main>;
}
