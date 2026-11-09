import { WorkspaceHeader } from "@/components/workspace-header";
import { DocumentEditor, DocumentOperation } from "@/components/document-forms";
import { DocumentDownload } from "@/components/document-download";
import { DocumentView } from "@/components/document-view";
import { documentStatus, editableDocumentStates, type DocumentSnapshot } from "@/lib/commercial-documents";
import { DocumentProblem, documentPreview, readCommercialDocument } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";
export const metadata={title:"Job document | Mias",robots:{index:false,follow:false}};
export default async function StaffDocument({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{notice?:string}>}) {
  const {id}=await params,viewer=await requireViewer(["owner","staff"],"/staff/documents/"+id);
  const {document,jobReference}=await readCommercialDocument(viewer,id);
  const notice=(await searchParams).notice;
  const editable=editableDocumentStates.includes(document.status),submitted=document.status==="submitted";
  let snapshot:DocumentSnapshot|null=null,problem="";
  try {snapshot=await documentPreview(viewer,id);} catch(error) {
    if(!(error instanceof DocumentProblem))throw error;
    problem=error.message;
  }
  const notices:Record<string,string>={issued:"Test document issued.",cancelled:"Document cancelled.",submitted:"Draft submitted for Owner review.",returned:"Draft returned for changes.","template-refreshed":"Review preview updated with reviewed business settings."};
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={document.reference??"Draft "+document.kind} current="documents"/>
    {notice&&notices[notice]&&(notice!=="submitted"||submitted)&&(notice!=="returned"||document.status==="returned")&&<p role="status" className="form-success">{notices[notice]}</p>}
    <p><a href="/staff/documents">← Document register</a> · <a href={"/staff/jobs/"+jobReference}>{jobReference}</a></p>
    <p className="notice"><strong>{documentStatus(document.status)}</strong>{submitted&&` · Submitted by ${document.submittedBy}. Review the saved version below.`}</p>
    {document.reviewReason&&<aside className="account-card"><h2>Owner feedback</h2><p className="document-feedback">{document.reviewReason}</p></aside>}
    <nav className="document-toolbar" aria-label="Document actions">
      {snapshot&&<a className="button button-light button-small" href={`/staff/documents/${id}/preview`}>{editable?"Preview draft":"Preview document"}</a>}
      {editable&&<a className="button button-light button-small" href="#document-editor">Edit draft</a>}
      {submitted&&viewer.role==="owner"&&<a className="button button-small" href="#owner-review">Review draft</a>}
    </nav>
    {snapshot&&<DocumentDownload id={id} staff/>}
    {submitted&&snapshot?.templateReviewed===false&&<aside className="account-card"><h2>Business settings await Owner review</h2><p>This draft is in the review queue. Before issuing, an Owner must review the business and bank details, then apply them to the preview.</p>{viewer.role==="owner"&&<><p><a className="button button-light button-small" href="/staff/documents/settings">Review business settings</a></p><DocumentOperation id={id} version={document.version} operation="refresh"/></>}</aside>}
    {problem&&<p className="notice">Save a complete draft to preview or download it. {problem}</p>}
    {submitted&&snapshot&&<section aria-label="Submitted draft preview"><h2>Submitted draft preview</h2><DocumentView snapshot={snapshot}/></section>}
    {submitted&&(viewer.role==="owner"?<div className="job-columns" id="owner-review"><DocumentOperation id={id} version={document.version} operation="issue"/><DocumentOperation id={id} version={document.version} operation="return"/></div>
      :<p className="notice">Awaiting Owner review. Saving changes withdraws this submission; submit the updated draft again.</p>)}
    {editable&&<section id="document-editor">
      {submitted&&viewer.role==="owner"&&<p className="notice">Saving changes withdraws this submission. Submit the updated draft again before approving.</p>}
      <div className="job-columns"><DocumentEditor key={id} id={id} version={document.version} draft={document.draft}/><div>
        {!submitted&&<DocumentOperation id={id} version={document.version} operation="submit"/>}
        {viewer.role==="owner"&&<p><a href="/staff/documents/settings">Document settings</a></p>}
      </div></div>
    </section>}
    {document.status==="issued"&&<div className="job-columns"><DocumentOperation id={id} version={document.version} operation="revise"/>{viewer.role==="owner"&&<DocumentOperation id={id} version={document.version} operation="cancel"/>}</div>}
    {!submitted&&snapshot&&<section aria-label="Saved document preview"><h2>{editable?"Saved draft preview":"Issued document"}</h2><DocumentView snapshot={snapshot}/></section>}
  </main>;
}
