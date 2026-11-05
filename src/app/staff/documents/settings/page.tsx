import { WorkspaceHeader } from "@/components/workspace-header";
import { DocumentSettingsForm } from "@/components/document-forms";
import { getDocumentSettings } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";
export const metadata={title:"Document settings | Mias",robots:{index:false,follow:false}};
export default async function Settings() {
  const viewer=await requireViewer(["owner"],"/staff/documents/settings"),settings=await getDocumentSettings();
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Document settings" current="documents"/>
    <p>Business and bank details are used inside protected job documents. Issued documents keep their saved version.</p>
    {!settings.version&&<p className="notice">Review and save these details before issuing a test document.</p>}
    <DocumentSettingsForm data={settings.data} version={settings.version}/>
  </main>;
}
