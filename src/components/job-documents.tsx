import { randomUUID } from "node:crypto";
import { CreateDocumentForm } from "@/components/document-forms";
import { documentList } from "@/server/commercial-documents";
import type { Viewer } from "@/server/session";
export async function JobDocuments({viewer,reference}:{viewer:Viewer;reference:string}) {
  const rows=await documentList(viewer,reference);
  const staff=viewer.role!=="customer";
  return <section className="account-card"><h2>Quotations and invoices</h2>
    {rows.length?<ul>{rows.map(row=><li key={row.id}><a href={`/${staff?"staff":"account"}/documents/${row.id}`}>{row.reference??"Draft "+row.kind}</a> · {row.status}</li>)}</ul>:<p>No {staff?"documents":"issued documents"} for this job yet.</p>}
    {staff&&<CreateDocumentForm job={reference} keyValue={randomUUID()}/>}
  </section>;
}
