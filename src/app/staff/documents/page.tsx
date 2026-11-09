import { randomUUID } from "node:crypto";
import { WorkspaceHeader } from "@/components/workspace-header";
import { CreateDocumentForm } from "@/components/document-forms";
import { documentStatus, editableDocumentStates } from "@/lib/commercial-documents";
import { documentList } from "@/server/commercial-documents";
import { listJobs } from "@/server/jobs";
import { requireViewer } from "@/server/session";
export const metadata={title:"Documents | Mias workspace",robots:{index:false,follow:false}};
export default async function Documents() {
  const viewer=await requireViewer(["owner","staff"],"/staff/documents");
  const rows=await documentList(viewer),jobs=await listJobs(viewer);
  const pending=rows.filter(row=>row.status==="submitted");
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Documents" current="documents"/>
    <p>Prepare a quotation or invoice for a job. An Owner reviews and issues the saved version.</p>
    <nav className="content-actions" aria-label="Document shortcuts"><a href="#document-register">Saved documents</a><a href="#new-document">New quotation or invoice</a></nav>
    <p className="notice">Local test documents use TEST numbers. Tax treatment and live numbering need business confirmation.</p>
    {viewer.role==="owner"&&<p><a href="/staff/documents/settings">Business and bank settings</a></p>}
    {viewer.role==="owner"&&<section className="account-card"><h2>Awaiting Owner review</h2>{pending.length?<ul className="document-register">{pending.map(row=><li key={row.id}>
      <strong>{row.customer} · {row.kind}</strong><span>{row.jobReference}</span><div className="document-toolbar"><a href={`/staff/documents/${row.id}/preview`}>Preview draft</a><a className="button button-small" href={`/staff/documents/${row.id}#owner-review`}>Review draft</a></div>
    </li>)}</ul>:<p>No drafts awaiting review.</p>}</section>}
    <section className="account-card" id="document-register" tabIndex={-1}><h2>Document register</h2>{rows.length?<ul className="document-register">{rows.map(row=><li key={row.id}>
      <a href={"/staff/documents/"+row.id}>{row.reference??"Draft "+row.kind}</a><span>{row.customer} · {row.jobReference} · {documentStatus(row.status)}</span>
      <div className="document-toolbar"><a href={`/staff/documents/${row.id}/preview`}>{editableDocumentStates.includes(row.status)?"Preview draft":"Preview document"}</a>
        {editableDocumentStates.includes(row.status)&&<a href={`/staff/documents/${row.id}#document-editor`}>Edit draft</a>}
        {row.status==="submitted"&&viewer.role==="owner"&&<a href={`/staff/documents/${row.id}#owner-review`}>Review draft</a>}
      </div></li>)}</ul>:<p>No documents yet.</p>}</section>
    <section className="account-card" id="new-document" tabIndex={-1}><h2>Create a document</h2>{jobs.length?<CreateDocumentForm keyValue={randomUUID()} jobs={jobs}/>:<p>Accept a request into a job first.</p>}</section>
  </main>;
}
