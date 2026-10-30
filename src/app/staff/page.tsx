import type { Metadata } from "next";
import { inquiryServices } from "@/lib/inquiry";
import { WorkspaceHeader } from "@/components/workspace-header";
import { searchInquiries } from "@/server/inquiries";
import { requireViewer } from "@/server/session";
import { requestStages } from "@/lib/jobs";

// Signed-in content must never be pre-rendered at build time (found in production verification, 007).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiries | Mias company workspace", robots: { index: false, follow: false } };
const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" });
const statusLabels: Record<string, string> = { sent: "Delivered", failed: "Failed, retrying", pending: "Waiting" };

// Every inquiry, for Owners and Staff only (spec 007, STAFF-01).
export default async function StaffInquiries({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const viewer = await requireViewer(["staff", "owner"], "/staff");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 100) : "";
  const rows = await searchInquiries(query);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Inquiries" current="inquiries" />
    <form className="search-bar" role="search" action="/staff">
      <div><label htmlFor="staff-search">Search inquiries</label><input id="staff-search" name="q" defaultValue={query} placeholder="Reference, name, phone or email" /></div>
      <button className="button button-small" type="submit">Search</button>
    </form>
    <p className="field-hint">Open an inquiry to review its details. Use Review / accept to enter the agreed work, assign staff and create a job.</p>
    <p className="muted">{rows.length === 1 ? "1 inquiry" : `${rows.length} inquiries`}{query ? ` matching “${query}”` : ", newest first"}</p>
    {rows.length > 0 && <div className="table-scroll"><table className="data-table">
      <thead><tr><th>Reference</th><th>Actions</th><th>Name</th><th>Service</th><th>Area</th><th>Received</th><th>Review</th><th>Notification</th></tr></thead>
      <tbody>{rows.map(({ inquiry, status }) => <tr key={inquiry.id}>
        <td><a id={`inquiry-${inquiry.id}`} href={`/staff/inquiries/${inquiry.reference}`}>{inquiry.reference}</a></td>
        <td><a className="button button-small button-light" style={{ whiteSpace: "nowrap" }} aria-describedby={`inquiry-${inquiry.id}`} href={`/staff/inquiries/${inquiry.reference}${inquiry.reviewStatus === "accepted" ? "" : inquiry.reviewStatus === "closed" ? "#review-request" : "#accept-request"}`}>
          {inquiry.reviewStatus === "accepted" ? "View inquiry" : inquiry.reviewStatus === "closed" ? "Review inquiry" : "Review / accept"}
        </a></td>
        <td>{inquiry.name}</td><td>{inquiryServices[inquiry.service as keyof typeof inquiryServices]}</td><td>{inquiry.area ?? "—"}</td>
        <td>{when.format(inquiry.createdAt)}</td><td>{requestStages[inquiry.reviewStatus as keyof typeof requestStages]}</td><td>{statusLabels[status ?? ""] ?? "—"}</td>
      </tr>)}</tbody>
    </table></div>}
  </main>;
}
