import { DocumentView } from "@/components/document-view";
import { DocumentDownload } from "@/components/document-download";
import { readCommercialDocument } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";
export const metadata={title:"Your document | Mias",robots:{index:false,follow:false}};
export default async function CustomerDocument({params}:{params:Promise<{id:string}>}) {
  const {id}=await params,viewer=await requireViewer(["customer","owner","staff"],"/account/documents/"+id);
  const {document,jobReference}=await readCommercialDocument({...viewer,role:"customer"},id);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <p><a href={"/account/jobs/"+jobReference}>← Your job</a></p><h1>{document.reference}</h1><p>Status: {document.status}</p>
    <DocumentDownload id={id}/>
    <DocumentView snapshot={document.snapshot!}/>
  </main>;
}
