import { documentList } from "@/server/commercial-documents";
import type { Viewer } from "@/server/session";
export async function WorkspaceReviewSummary({viewer}:{viewer:Viewer}) {
  if(viewer.role!=="owner")return null;
  const rows=await documentList(viewer),pending=rows.filter(row=>row.status==="submitted"),drafts=rows.filter(row=>["draft","returned"].includes(row.status));
  return <section className="account-card workspace-review" data-document-review><h2>Document review</h2>
    <p><strong>{pending.length} awaiting Owner review</strong> · {drafts.length} saved draft{drafts.length===1?"":"s"} not submitted</p>
    <p><a className="button button-small" href="/staff/documents">Review documents</a></p>
    {pending.length>0&&<ul>{pending.slice(0,5).map(row=><li key={row.id}><a href={`/staff/documents/${row.id}#owner-review`}>Review {row.kind} for {row.customer}</a> · {row.jobReference}</li>)}</ul>}
    {!pending.length&&drafts.length>0&&<p>Saved drafts are available in the register. Staff must select Submit for review to put them in the queue.</p>}
  </section>;
}
