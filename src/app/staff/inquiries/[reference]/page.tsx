import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone, replyMethods, type ReplyMethod } from "@/lib/inquiry-submission";
import { WorkspaceHeader } from "@/components/workspace-header";
import { getDb } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { findInquiry } from "@/server/inquiries";
import { requireViewer } from "@/server/session";
import { activeStaff, jobForInquiry } from "@/server/jobs";
import { JobWorkflowForm, ReviewForm } from "@/components/job-forms";
import { requestStages } from "@/lib/jobs";
import { SolarSummary } from "@/components/solar-summary";

// Signed-in content must never be pre-rendered at build time (found in production verification, 007).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiry | Mias company workspace", robots: { index: false, follow: false } };
const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "full", timeStyle: "short" });

export default async function InquiryDetail({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  // The role check runs before the lookup, so other accounts learn nothing about which references exist (ROLE-03).
  const viewer = await requireViewer(["staff", "owner"], `/staff/inquiries/${reference}`);
  const found = await findInquiry(reference);
  if (!found) notFound();
  const { inquiry, status, attempts } = found;
  const existingJob = await jobForInquiry(inquiry.id);
  const [account] = inquiry.userId ? await (await getDb()).select({ email: user.email }).from(user).where(eq(user.id, inquiry.userId)) : [];
  const rows: [string, string][] = [
    ["Received", `${when.format(inquiry.createdAt)} (Zambia time)`], ["Name", inquiry.name],
    ["Phone", inquiry.phone ? displayPhone(inquiry.phone) : "—"], ["Email", inquiry.email ?? "—"],
    ["Reply by", replyMethods[inquiry.preferredReply as ReplyMethod]], ["Service", inquiryServices[inquiry.service as keyof typeof inquiryServices]],
    ["Project area", inquiry.area ?? "—"], ["Customer account", account ? account.email : "Sent without signing in"],
    ["Notification", status ? `${status} (${attempts} attempt${attempts === 1 ? "" : "s"})` : "—"], ["Project details", inquiry.message],
  ];
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={inquiry.reference} current="inquiries" />
    <p className="account-links"><a href="/staff">← All inquiries</a>{!existingJob && <> · <a href="#review-request">Review request</a>{inquiry.reviewStatus !== "closed" && <> · <a href="#accept-request">Accept request</a></>}</>}</p>
    <dl className="detail-list">{rows.map(([term, value]) => <div key={term} style={{ display: "contents" }}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    {inquiry.solarPlan&&<SolarSummary plan={inquiry.solarPlan}/>}
    <p className="notice">Review: {requestStages[inquiry.reviewStatus as keyof typeof requestStages]}{inquiry.reviewReason ? ` · ${inquiry.reviewReason}` : ""}</p>
    {existingJob ? <p><a className="button" href={`/staff/jobs/${existingJob.reference}`}>Open job</a></p> : <div className="job-columns">
      <section className="account-card" id="review-request"><h2>Review request</h2><ReviewForm reference={inquiry.reference} version={inquiry.version} status={inquiry.reviewStatus} /></section>
      {inquiry.reviewStatus !== "closed" && <section className="account-card" id="accept-request"><h2>Accept request</h2><JobWorkflowForm accept people={await activeStaff()} job={{ reference: inquiry.reference, version: inquiry.version, scope: "", nextStep: "", assigneeId: viewer.id, stage: "assessment" }} /></section>}
    </div>}
  </main>;
}
