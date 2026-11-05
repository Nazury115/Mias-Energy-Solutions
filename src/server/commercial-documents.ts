import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { and, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { business } from "@/content/site";
import { blankDocument, calculateDocument, documentProblem, editableDocumentStates, issuedDocumentStates, templateProblem, type DocumentDraft, type DocumentSnapshot, type DocumentTemplate } from "@/lib/commercial-documents";
import { databaseDir, getDb } from "@/server/db/client";
import { auditLog, commercialDocuments, documentCounters, documentSettings, inquiries, jobs } from "@/server/db/schema";
import { jobAccess } from "@/server/jobs";
import { createDocumentPdf } from "@/server/document-pdf";
import { createDocumentExcel } from "@/server/document-excel";
import type { Viewer } from "@/server/session";

export class DocumentProblem extends Error {}
const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const staff=(viewer:Viewer)=>{if(!["owner","staff"].includes(viewer.role))notFound();};
const conflict="This document changed. Reload before saving or approving it.";
export const templateKeys=["name","address","phone","email","bankDetails","preparedBy","taxNote"] as const;

export async function getDocumentSettings() {
  const [stored]=await (await getDb()).select().from(documentSettings).where(eq(documentSettings.id,"business"));
  if(stored)return stored;
  const defaults:DocumentTemplate={name:business.name,address:"",phone:business.phoneDisplay,email:business.contacts.email,bankDetails:"",preparedBy:"",taxNote:"Tax treatment pending business confirmation."};
  let source:Partial<DocumentTemplate>={};
  try {source=JSON.parse(await readFile(path.join(path.dirname(databaseDir()),"document-template.json"),"utf8"));} catch {/* No private template has been imported. */}
  const data={...defaults};
  for(const key of templateKeys)if(typeof source[key]==="string")data[key]=source[key]!;
  return {id:"business",data,version:0,approvedBy:""};
}

export async function saveDocumentSettings(viewer:Viewer,version:number,data:DocumentTemplate,checked:boolean) {
  if(viewer.role!=="owner")notFound();
  if(!checked)throw new DocumentProblem("Confirm that you checked the business and bank details.");
  const problem=templateProblem(data);
  if(problem)throw new DocumentProblem(problem);
  await (await getDb()).transaction(async tx=>{
    const [current]=await tx.select().from(documentSettings).where(eq(documentSettings.id,"business")).for("update");
    if((current?.version??0)!==version)throw new DocumentProblem(conflict);
    if(current)await tx.update(documentSettings).set({data,version:version+1,approvedBy:viewer.name}).where(eq(documentSettings.id,"business"));
    else await tx.insert(documentSettings).values({id:"business",data,version:1,approvedBy:viewer.name});
    await tx.insert(auditLog).values({actorId:viewer.id,action:"documents.settings",detail:"Document business template reviewed and saved."});
  });
}

export async function documentList(viewer:Viewer,reference?:string) {
  return (await getDb()).select({id:commercialDocuments.id,reference:commercialDocuments.reference,kind:commercialDocuments.kind,status:commercialDocuments.status,
    jobReference:jobs.reference,customer:sql<string>`${commercialDocuments.draft}->>'customer'`}).from(commercialDocuments)
    .innerJoin(jobs,eq(jobs.id,commercialDocuments.jobId)).where(and(jobAccess(viewer),
      viewer.role==="customer"?inArray(commercialDocuments.status,issuedDocumentStates):undefined,reference?eq(jobs.reference,reference):undefined))
    .orderBy(desc(commercialDocuments.createdAt));
}

export async function readCommercialDocument(viewer:Viewer,id:string) {
  if(!uuid.test(id))notFound();
  // File bytes are fetched separately only when a permitted download needs them.
  const {pdf: _pdf,xlsx: _xlsx,...columns}=getTableColumns(commercialDocuments);
  void _pdf; void _xlsx;
  const [row]=await (await getDb()).select({document:columns,jobReference:jobs.reference}).from(commercialDocuments)
    .innerJoin(jobs,eq(jobs.id,commercialDocuments.jobId)).where(and(eq(commercialDocuments.id,id),jobAccess(viewer),
      viewer.role==="customer"?inArray(commercialDocuments.status,issuedDocumentStates):undefined));
  if(!row)notFound();
  return row;
}

export async function createCommercialDocument(viewer:Viewer,reference:string,kind:string,key:string) {
  staff(viewer);
  if(!["quotation","invoice"].includes(kind)||!uuid.test(key))throw new DocumentProblem("Choose a document type and reload the job.");
  await (await getDb()).transaction(async tx=>{
    const [job]=await tx.select().from(jobs).where(eq(jobs.reference,reference)).for("update");
    if(!job)notFound();
    const [existing]=await tx.select().from(commercialDocuments).where(eq(commercialDocuments.id,key));
    if(existing){if(existing.jobId!==job.id||existing.kind!==kind)throw new DocumentProblem("Reload to create another document.");return;}
    const [inquiry]=await tx.select().from(inquiries).where(eq(inquiries.id,job.inquiryId));
    await tx.insert(commercialDocuments).values({id:key,jobId:job.id,kind,draft:{...blankDocument,customer:inquiry.name,
      contact:[inquiry.email,inquiry.phone].filter(Boolean).join(" · ")}});
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.created",detail:`${key} — draft ${kind} created.`});
  });
  return key;
}

export async function saveCommercialDocument(viewer:Viewer,id:string,version:number,draft:DocumentDraft) {
  staff(viewer);
  const problem=documentProblem(draft);
  if(problem)throw new DocumentProblem(problem);
  if(!uuid.test(id))notFound();
  await (await getDb()).transaction(async tx=>{
    const changed=await tx.update(commercialDocuments).set({draft,status:"draft",reviewSnapshot:null,submittedAt:null,submittedBy:null,version:sql`${commercialDocuments.version}+1`})
      .where(and(eq(commercialDocuments.id,id),eq(commercialDocuments.version,version),inArray(commercialDocuments.status,editableDocumentStates))).returning({id:commercialDocuments.id});
    if(!changed.length)throw new DocumentProblem(conflict);
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.saved",detail:`${id} — draft edited by ${viewer.name}`});
  });
}

export async function submitCommercialDocument(viewer:Viewer,id:string,version:number) {
  staff(viewer);
  if(!uuid.test(id))notFound();
  await (await getDb()).transaction(async tx=>{
    const [document]=await tx.select().from(commercialDocuments).where(eq(commercialDocuments.id,id)).for("update");
    if(!document)notFound();
    if(document.status==="submitted"&&document.version===version+1)return;
    if(!["draft","returned"].includes(document.status)||document.version!==version)throw new DocumentProblem(conflict);
    const problem=documentProblem(document.draft);
    if(problem)throw new DocumentProblem(problem);
    const [settings]=await tx.select().from(documentSettings).where(eq(documentSettings.id,"business")).for("share");
    if(!settings)throw new DocumentProblem("An Owner must review and save the document settings before submission.");
    const [job]=await tx.select().from(jobs).where(eq(jobs.id,document.jobId));
    const totals=calculateDocument(document.draft.lines,document.draft.overallDiscount);
    if("error" in totals)throw new DocumentProblem(totals.error);
    let previous:string|null=null;
    if(document.revisionOf) {
      const [source]=await tx.select({reference:commercialDocuments.reference}).from(commercialDocuments).where(eq(commercialDocuments.id,document.revisionOf));
      previous=source?.reference??null;
    }
    const reviewSnapshot:DocumentSnapshot={kind:document.kind,reference:"SUBMITTED DRAFT",date:"Not issued",jobReference:job.reference,
      draft:document.draft,template:settings.data,totals,issuedBy:"Not issued",revisionOf:previous};
    await tx.update(commercialDocuments).set({status:"submitted",reviewSnapshot,reviewReason:null,submittedAt:new Date(),submittedBy:viewer.name,version:version+1})
      .where(eq(commercialDocuments.id,id));
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.submitted",detail:`${id} — saved version submitted for review.`});
  });
}

export async function returnCommercialDocument(viewer:Viewer,id:string,version:number,reason:string) {
  if(viewer.role!=="owner")notFound();
  if(!uuid.test(id))notFound();
  if(!reason.trim()||reason.length>500)throw new DocumentProblem("Enter a return reason of up to 500 characters.");
  await (await getDb()).transaction(async tx=>{
    const changed=await tx.update(commercialDocuments).set({status:"returned",reviewReason:reason.trim(),version:version+1})
      .where(and(eq(commercialDocuments.id,id),eq(commercialDocuments.version,version),eq(commercialDocuments.status,"submitted"))).returning({id:commercialDocuments.id});
    if(!changed.length)throw new DocumentProblem(conflict);
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.returned",detail:`${id} — ${reason.trim()}`});
  });
}

export async function issueCommercialDocument(viewer:Viewer,id:string,version:number,reason:string) {
  if(viewer.role!=="owner")notFound();
  if(!uuid.test(id))notFound();
  if(!reason.trim()||reason.length>500)throw new DocumentProblem("Enter an approval reason of up to 500 characters.");
  await (await getDb()).transaction(async tx=>{
    const [document]=await tx.select().from(commercialDocuments).where(eq(commercialDocuments.id,id)).for("update");
    if(!document)notFound();
    if(document.status==="issued")return;
    if(document.status!=="submitted"||document.version!==version||!document.reviewSnapshot)throw new DocumentProblem(conflict);
    const [job]=await tx.select().from(jobs).where(eq(jobs.id,document.jobId));
    let previous:string|null=null;
    if(document.revisionOf) {
      const [source]=await tx.select().from(commercialDocuments).where(eq(commercialDocuments.id,document.revisionOf)).for("update");
      if(!source||source.jobId!==job.id||source.status!=="issued")throw new DocumentProblem("The original document is no longer current. Reload it before revising.");
      previous=source.reference;
      await tx.update(commercialDocuments).set({status:"superseded",version:sql`${commercialDocuments.version}+1`}).where(eq(commercialDocuments.id,source.id));
    }
    await tx.insert(documentCounters).values({kind:document.kind,nextNumber:1}).onConflictDoNothing();
    const [counter]=await tx.update(documentCounters).set({nextNumber:sql`${documentCounters.nextNumber}+1`})
      .where(eq(documentCounters.kind,document.kind)).returning();
    const date=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lusaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const reference=`TEST-${document.kind==="invoice"?"I":"Q"}-${date.slice(0,4)}-${String(counter.nextNumber-1).padStart(6,"0")}`;
    const snapshot:DocumentSnapshot={...document.reviewSnapshot,reference,date,issuedBy:viewer.name,revisionOf:previous};
    let pdf:Buffer,xlsx:Buffer;
    try { [pdf,xlsx]=await Promise.all([createDocumentPdf(snapshot),createDocumentExcel(snapshot)]); }
    catch {throw new DocumentProblem("The document files could not be created. Check the document text for unsupported characters and try again.");}
    await tx.update(commercialDocuments).set({snapshot,reference,status:"issued",version:version+1,
      pdf:sql`decode(${pdf.toString("base64")},'base64')`,xlsx:sql`decode(${xlsx.toString("base64")},'base64')`}).where(eq(commercialDocuments.id,id));
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.issued",detail:`${id} — ${reference} — ${reason.trim()}`});
  });
}

export async function reviseCommercialDocument(viewer:Viewer,id:string) {
  staff(viewer);
  if(!uuid.test(id))notFound();
  return (await getDb()).transaction(async tx=>{
    const [source]=await tx.select().from(commercialDocuments).where(eq(commercialDocuments.id,id)).for("update");
    if(!source||source.status!=="issued"||!source.snapshot)throw new DocumentProblem("Only the current issued document can be revised.");
    const [existing]=await tx.select().from(commercialDocuments).where(and(eq(commercialDocuments.revisionOf,id),inArray(commercialDocuments.status,editableDocumentStates)));
    if(existing)return existing.id;
    const [draft]=await tx.insert(commercialDocuments).values({jobId:source.jobId,kind:source.kind,revisionOf:id,draft:source.snapshot.draft}).returning();
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.revision",detail:`${draft.id} — revision of ${source.reference}`});
    return draft.id;
  });
}

export async function cancelCommercialDocument(viewer:Viewer,id:string,version:number,reason:string) {
  if(viewer.role!=="owner")notFound();
  if(!uuid.test(id)||!reason.trim()||reason.length>500)throw new DocumentProblem("Enter a cancellation reason of up to 500 characters.");
  await (await getDb()).transaction(async tx=>{
    const changed=await tx.update(commercialDocuments).set({status:"cancelled",version:version+1}).where(and(eq(commercialDocuments.id,id),
      eq(commercialDocuments.version,version),eq(commercialDocuments.status,"issued"))).returning();
    if(!changed.length)throw new DocumentProblem(conflict);
    await tx.insert(auditLog).values({actorId:viewer.id,action:"document.cancelled",detail:`${id} — ${reason.trim()}`});
  });
}

export async function documentPreview(viewer:Viewer,id:string) {
  const {document,jobReference}=await readCommercialDocument(viewer,id);
  if(document.snapshot)return document.snapshot;
  staff(viewer);
  if(document.reviewSnapshot)return document.reviewSnapshot;
  const problem=documentProblem(document.draft);
  if(problem)throw new DocumentProblem(problem);
  const totals=calculateDocument(document.draft.lines,document.draft.overallDiscount);
  if("error" in totals)throw new DocumentProblem(totals.error);
  const settings=await getDocumentSettings();
  return {kind:document.kind,reference:"DRAFT",jobReference,date:"Not issued",draft:document.draft,
    template:settings.data,totals,issuedBy:"Not issued",revisionOf:null} satisfies DocumentSnapshot;
}

export async function commercialDownload(viewer:Viewer,id:string,format:"pdf"|"xlsx") {
  const snapshot=await documentPreview(viewer,id);
  if(issuedDocumentStates.includes((await readCommercialDocument(viewer,id)).document.status)) {
    const column=format==="pdf"?commercialDocuments.pdf:commercialDocuments.xlsx;
    const [stored]=await (await getDb()).select({body:sql<string|null>`encode(${column},'base64')`}).from(commercialDocuments).where(eq(commercialDocuments.id,id));
    if(stored.body)return {bytes:Buffer.from(stored.body,"base64"),name:snapshot.reference};
  }
  return {bytes:await (format==="pdf"?createDocumentPdf(snapshot):createDocumentExcel(snapshot)),name:snapshot.reference==="DRAFT"||snapshot.reference==="SUBMITTED DRAFT"?"draft":snapshot.reference};
}

export async function commercialPdf(viewer:Viewer,id:string) {
  return commercialDownload(viewer,id,"pdf");
}
