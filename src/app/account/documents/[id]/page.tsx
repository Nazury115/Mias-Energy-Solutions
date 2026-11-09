import { DocumentView } from "@/components/document-view";
import { readCommercialDocument } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";
export const metadata={title:"Your document | Mias",robots:{index:false,follow:false}};
export default async function CustomerDocument({params}:{params:Promise<{id:string}>}) {
  const {id}=await params,viewer=await requireViewer(["customer","owner","staff"],"/account/documents/"+id);
  const {document,jobReference}=await readCommercialDocument({...viewer,role:"customer"},id);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <p><a href={"/account/jobs/"+jobReference}>← Your job</a></p><h1>{document.kind === "invoice" ? "Invoice" : "Quotation"}</h1><p>{document.reference} · {jobReference}</p><p>Status: {document.status}</p>
    <div className="document-download">
      <a className="button button-small" download href={`/documents/${id}/download?format=pdf`}>Download PDF</a>
      <a className="inline-link" download href={`/documents/${id}/download?format=xlsx`}>Download Excel</a>
    </div>
    <DocumentView snapshot={document.snapshot!}/>
  </main>;
}
