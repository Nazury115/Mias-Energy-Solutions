import { randomUUID } from "node:crypto";
import { CreateDocumentForm } from "@/components/document-forms";
import { documentList } from "@/server/commercial-documents";
import type { Viewer } from "@/server/session";
export async function JobDocuments({viewer,reference}:{viewer:Viewer;reference:string}) {
  const rows=await documentList(viewer,reference);
  const staff=viewer.role!=="customer";
  if (!staff) return <section className="account-card">
    <h2 id="documents" tabIndex={-1}>Quotations and invoices</h2>
    {rows.length ? <ul className="portal-documents">{rows.map(row => <li key={row.id}>
      <a className="inline-link" href={`/account/documents/${row.id}`}>
        {row.kind === "invoice" ? "Invoice" : "Quotation"} · {row.reference}
      </a>
      <p>{[row.status, row.issueDate && `Issued ${row.issueDate}`, row.total && `ZMW ${row.total}`].filter(Boolean).join(" · ")}</p>
    </li>)}</ul> : <p>No issued documents for this job yet.</p>}
  </section>;
  return <section className="account-card"><h2>Quotations and invoices</h2>
    {rows.length?<ul>{rows.map(row=><li key={row.id}><a href={`/staff/documents/${row.id}`}>{row.reference??"Draft "+row.kind}</a> · {row.status}</li>)}</ul>:<p>No documents for this job yet.</p>}
    <CreateDocumentForm job={reference} keyValue={randomUUID()}/>
  </section>;
}
