import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DocumentSnapshot } from "@/lib/commercial-documents";

const navy = rgb(0.06,0.18,0.29);
const blue = rgb(0.03,0.35,0.72);
const muted = rgb(0.33,0.4,0.47);
const amount = (value:string) => value.replace(/\B(?=(\d{3})+(?!\d))/g,",");

export async function createDocumentPdf(snapshot:DocumentSnapshot):Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(await readFile(path.join(process.cwd(),"public/brand/mias-logo-concept.png")));
  const { draft, template, totals } = snapshot;
  let page = pdf.addPage([595.28,841.89]);
  let y = 790;
  let table = false;
  function text(value:string,x:number,top:number,size=9,strong=false,color=navy) {
    page.drawText(value,{x,y:top,size,font:strong?bold:regular,color});
  }
  function lines(value:string,width:number,size=9) {
    const result:string[]=[];
    for (const paragraph of value.replace(/\r/g,"").split("\n")) {
      let current="";
      for (const word of paragraph.split(/\s+/)) {
        const candidate=current ? current+" "+word : word;
        if(regular.widthOfTextAtSize(candidate,size)<=width) {current=candidate;continue;}
        if(current) {result.push(current);current="";}
        for(const character of word) {
          if(regular.widthOfTextAtSize(current+character,size)>width) {result.push(current);current=character;}
          else current+=character;
        }
      }
      result.push(current);
    }
    return result;
  }
  function tableHeader() {
    page.drawRectangle({x:40,y:y-17,width:515,height:23,color:blue});
    for (const [label,x] of [["Description",45],["Qty / unit",267],["Unit price",331],["Discount ZMW",408],["Amount ZMW",476]] as const) text(label,x,y-10,8,true,rgb(1,1,1));
    y-=28;
  }
  function nextPage() {
    page=pdf.addPage([595.28,841.89]);
    const companyBottom=block(template.name,40,797,300,true);
    text(snapshot.reference,360,797,10,true);
    y=Math.min(766,companyBottom-15);
    if(table)tableHeader();
  }
  function space(height:number) { if(y-height<60)nextPage(); }
  function block(value:string,x:number,top:number,width:number,strong=false) {
    for(const line of lines(value,width)) {text(line,x,top,9,strong);top-=12;}
    return top;
  }
  function paragraph(label:string,value:string) {
    if(!value)return;
    space(42);text(label,40,y,10,true);y-=17;
    for(const line of lines(value,515)) {space(14);text(line,40,y);y-=13;}
    y-=12;
  }
  page.drawImage(logo,{x:40,y:741,width:176,height:61});
  text("TEST "+snapshot.kind.toUpperCase(),365,780,19,true);
  text(snapshot.reference,365,759,10);
  text("Issued "+snapshot.date,365,744,9,false,muted);
  text("Job "+snapshot.jobReference,365,729,9,false,muted);
  let businessY=700;
  businessY=block(template.name,40,businessY,235,true);
  businessY=block(template.address,40,businessY,235);
  businessY=block([template.phone,template.email].filter(Boolean).join("\n"),40,businessY,235);
  text("BILL TO",300,700,10,true,blue);
  let customerY=680;
  customerY=block(draft.customer,300,customerY,250,true);
  customerY=block([draft.attention,draft.customerId,draft.address,draft.contact].filter(Boolean).join("\n"),300,customerY,250);
  y=Math.min(businessY,customerY)-22;
  table=true;space(30);tableHeader();
  draft.lines.forEach((line,index)=>{
    const description=lines(line.description,211);
    const qty=lines([line.quantity,line.unit].filter(Boolean).join(" "),59);
    const height=Math.max(description.length,qty.length)*12+13;
    space(height);
    if(index%2===0)page.drawRectangle({x:40,y:y-height+6,width:515,height,color:rgb(.96,.975,.99)});
    description.forEach((part,i)=>text(part,45,y-i*12,9));
    qty.forEach((part,i)=>text(part,267,y-i*12,8));
    for(const [value,right] of [[line.unitPrice,397],[line.discount||"0",468],[totals.amounts[index],551]] as const) {
      const displayed=amount(Number(value).toFixed(2));
      text(displayed,right-regular.widthOfTextAtSize(displayed,9),y,9);
    }
    y-=height;
  });
  table=false;y-=10;space(90);
  for(const [label,value] of [["Subtotal",totals.subtotal],[`Overall discount (${draft.overallDiscount || "0"}%)`,totals.discount],["Total ZMW",totals.total]]) {
    text(label,300,y,10,label==="Total ZMW");
    const displayed=amount(value);
    text(displayed,551-bold.widthOfTextAtSize(displayed,10),y,10,true);
    y-=20;
  }
  y-=12;
  paragraph(snapshot.kind==="quotation"?"Valid until":"Due date",draft.deadline);
  paragraph("Payment terms",draft.terms);
  paragraph("Tax treatment",template.taxNote);
  paragraph("Bank details",template.bankDetails);
  paragraph("Notes",draft.notes);
  paragraph("Prepared by",template.preparedBy);
  paragraph("Approved by",snapshot.issuedBy);
  if(snapshot.revisionOf)paragraph("Replaces document",snapshot.revisionOf);
  for(const [index,sheet] of pdf.getPages().entries()) {
    sheet.drawText("LOCAL TEST DOCUMENT",{x:40,y:30,size:8,font:bold,color:muted});
    sheet.drawText(`Page ${index+1} of ${pdf.getPageCount()}`,{x:480,y:30,size:8,font:regular,color:muted});
  }
  pdf.setTitle(snapshot.reference);
  return Buffer.from(await pdf.save());
}
