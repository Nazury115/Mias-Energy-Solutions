import type { DocumentSnapshot } from "@/lib/commercial-documents";

export function DocumentView({snapshot}:{snapshot:DocumentSnapshot}) {
  const {draft,template,totals}=snapshot;
  return <article className="document-paper">
    <header className="document-heading"><div><h2>{template.name}</h2><p>{template.address}</p><p>{template.phone}<br/>{template.email}</p></div>
      <div><p className="eyebrow">LOCAL TEST DOCUMENT</p><h2>{snapshot.kind==="invoice"?"Invoice":"Quotation"}</h2><p>{snapshot.reference}<br/>{snapshot.date}<br/>Job {snapshot.jobReference}</p></div></header>
    <section><h3>Customer details</h3><p>{[draft.customer,draft.attention,draft.customerId,draft.address,draft.contact].filter(Boolean).join("\n")}</p></section>
    <div className="table-scroll"><table className="data-table"><thead><tr><th>Description</th><th>Quantity / unit</th><th>Unit price ZMW</th><th>Line discount ZMW</th><th>Amount ZMW</th></tr></thead>
      <tbody>{draft.lines.map((line,index)=><tr key={index}><td>{line.description}</td><td>{line.quantity} {line.unit}</td><td>{line.unitPrice}</td><td>{line.discount||"0"}</td><td>{totals.amounts[index]}</td></tr>)}</tbody>
    </table></div>
    <dl className="document-totals"><div><dt>Subtotal</dt><dd>ZMW {totals.subtotal}</dd></div><div><dt>Overall discount ({draft.overallDiscount||"0"}%)</dt><dd>ZMW {totals.discount}</dd></div><div><dt>Total</dt><dd><strong>ZMW {totals.total}</strong></dd></div></dl>
    <h3>Payment terms</h3><p>{draft.terms}</p>
    {draft.deadline&&<p>{snapshot.kind==="quotation"?"Valid until":"Due date"} {draft.deadline}</p>}
    <h3>Tax treatment</h3><p>{template.taxNote}</p>
    {template.bankDetails&&<><h3>Bank details</h3><p>{template.bankDetails}</p></>}
    {draft.notes&&<><h3>Notes</h3><p>{draft.notes}</p></>}
    <p>Prepared by {template.preparedBy||"Not recorded"}<br/>Approved by {snapshot.issuedBy}</p>
    {snapshot.revisionOf&&<p>Replaces {snapshot.revisionOf}</p>}
  </article>;
}
