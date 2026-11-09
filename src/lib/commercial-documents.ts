export type DocumentLine = { description: string; quantity: string; unit: string; unitPrice: string; discount: string };
export const editableDocumentStates = ["draft", "submitted", "returned"];
export const issuedDocumentStates = ["issued", "superseded", "cancelled"];
export const documentStatus = (status: string) => ({draft:"Draft",submitted:"Awaiting Owner review",returned:"Returned for changes",issued:"Issued",superseded:"Superseded",cancelled:"Cancelled"})[status] ?? status;
export type DocumentDraft = {
  customer: string; attention: string; address: string; contact: string; customerId: string;
  terms: string; deadline: string; notes: string; overallDiscount: string; lines: DocumentLine[];
};
export type DocumentTemplate = {
  name: string; address: string; phone: string; email: string; bankDetails: string; preparedBy: string; taxNote: string;
};
export const templateLimits = { name:140,address:600,phone:60,email:254,bankDetails:1500,preparedBy:140,taxNote:600 };
export function templateProblem(data:DocumentTemplate):string|null {
  if(!data.name.trim()||!data.taxNote.trim())return "Enter a business name and tax-treatment note.";
  if(Object.entries(templateLimits).some(([key,max])=>typeof data[key as keyof DocumentTemplate]!=="string"||data[key as keyof DocumentTemplate].length>max))return "Shorten the business details to fit the document layout.";
  return null;
}
export type DocumentCalculation = { amounts: string[]; subtotal: string; discount: string; total: string };
export const documentFields = {customer:160,attention:160,address:600,contact:200,customerId:80,terms:600,deadline:10,notes:2000,overallDiscount:6};
export type DocumentSnapshot = {
  kind: string; reference: string; jobReference: string; date: string; draft: DocumentDraft;
  template: DocumentTemplate; totals: DocumentCalculation; issuedBy: string; revisionOf: string | null;
  templateReviewed?:boolean;
};
export const blankDocument: DocumentDraft = {
  customer: "", attention: "", address: "", contact: "", customerId: "", terms: "", deadline: "",
  notes: "", overallDiscount: "0", lines: [{description:"",quantity:"1",unit:"",unitPrice:"0",discount:"0"}],
};
const money = (value: bigint) => `${value / BigInt(100)}.${(value % BigInt(100)).toString().padStart(2,"0")}`;
function decimal(value: string, places: number): bigint {
  if (typeof value !== "string" || !new RegExp(`^\\d{1,9}(?:\\.\\d{1,${places}})?$`).test(value.trim())) throw new Error("Use non-negative decimal numbers with valid precision.");
  const [whole, fraction = ""] = value.trim().split(".");
  return BigInt(whole) * BigInt(10) ** BigInt(places) + BigInt(fraction.padEnd(places,"0"));
}
export function calculateDocument(lines: DocumentLine[], overallDiscount = "0"): DocumentCalculation | { error: string } {
  try {
    if (!Array.isArray(lines) || lines.length < 1 || lines.length > 40) throw new Error("Enter 1–40 line items.");
    let subtotal = BigInt(0);
    const amounts = lines.map(line => {
      if (!line.description?.trim() || line.description.length > 500 || line.unit.length > 30) throw new Error("Each line needs a description of up to 500 characters and a unit of up to 30.");
      const quantity = decimal(line.quantity,3);
      if (!quantity) throw new Error("Quantity must be greater than zero.");
      const gross = (quantity * decimal(line.unitPrice,2) + BigInt(500)) / BigInt(1000);
      const discount = decimal(line.discount || "0",2);
      if (discount > gross) throw new Error("A line discount cannot exceed its amount.");
      const amount = gross - discount;
      subtotal += amount;
      return money(amount);
    });
    const rate = decimal(overallDiscount || "0",2);
    if (rate > BigInt(10000)) throw new Error("The overall discount must be between 0 and 100 percent.");
    if (subtotal > BigInt(999999999999)) throw new Error("The total exceeds the supported document limit.");
    const discount = (subtotal * rate + BigInt(5000)) / BigInt(10000);
    return { amounts, subtotal: money(subtotal), discount: money(discount), total: money(subtotal - discount) };
  } catch (error) { return { error: error instanceof Error ? error.message : "Check the line items." }; }
}
export function documentProblem(draft: DocumentDraft): string | null {
  if (!draft.customer.trim() || !draft.terms.trim()) return "Enter the customer and payment terms.";
  for (const [key,value] of Object.entries(draft)) {
    if (key !== "lines" && (typeof value !== "string" || value.length > (documentFields[key as keyof typeof documentFields] ?? 0))) return "Check the document text field lengths.";
  }
  if (draft.deadline) {
    const date=new Date(draft.deadline+"T00:00:00Z");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==draft.deadline)return "Enter a valid expiry or due date.";
  }
  const result = calculateDocument(draft.lines,draft.overallDiscount);
  return "error" in result ? result.error : null;
}
