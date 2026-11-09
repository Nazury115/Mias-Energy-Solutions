import { DocumentDownload } from "@/components/document-download";
import { DocumentView } from "@/components/document-view";
import { DocumentProblem, documentPreview, readCommercialDocument } from "@/server/commercial-documents";
import { documentStatus, editableDocumentStates } from "@/lib/commercial-documents";
import { requireViewer } from "@/server/session";
export const metadata={title:"Document preview | Mias",robots:{index:false,follow:false}};
export default async function Preview({params}:{params:Promise<{id:string}>}) {
  const {id}=await params,viewer=await requireViewer(["owner","staff"],`/staff/documents/${id}/preview`);
  const {document}=await readCommercialDocument(viewer,id);
  const editable=editableDocumentStates.includes(document.status);
  let snapshot=null,problem="";
  try {snapshot=await documentPreview(viewer,id);} catch(error) {
    if(!(error instanceof DocumentProblem))throw error;
    problem=error.message;
  }
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <h1>{editable?"Draft preview":"Document preview"}</h1><p>{documentStatus(document.status)} · Preview of the saved version</p>
    {snapshot?.templateReviewed===false&&<p className="notice">Business settings await Owner review. This preview can be reviewed, but cannot be issued until reviewed settings are applied.</p>}
    <nav className="document-toolbar" aria-label="Preview actions"><a href={`/staff/documents/${id}`}>← Document details</a>
      {editable&&<a className="button button-light button-small" href={`/staff/documents/${id}#document-editor`}>Edit draft</a>}
      {document.status==="submitted"&&viewer.role==="owner"&&<a className="button button-small" href={`/staff/documents/${id}#owner-review`}>Review draft</a>}
    </nav>
    {snapshot?<><DocumentDownload id={id} staff/><DocumentView snapshot={snapshot}/></>:<p className="notice">Save a complete draft to preview it. {problem}</p>}
  </main>;
}
