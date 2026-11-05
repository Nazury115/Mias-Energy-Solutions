import { deflateRawSync } from "node:zlib";
import type { DocumentSnapshot } from "@/lib/commercial-documents";

const xml = (value:string) => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");

// Small ZIP32 container for the six fixed OOXML parts below. No user-controlled paths.
// Sizes are bounded by the document validator (40 lines, at most 500 characters each).
function archive(parts:Record<string,string>):Buffer {
  const local:Buffer[]=[],directory:Buffer[]=[];
  let offset=0;
  for(const [path,body] of Object.entries(parts)) {
    const name=Buffer.from(path),data=Buffer.from(body,"utf8"),compressed=deflateRawSync(data);
    let crc=0xffffffff;
    for(const byte of data) {
      crc^=byte;
      for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
    }
    crc=(crc^0xffffffff)>>>0;
    const header=Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(8,8);
    header.writeUInt16LE(33,12); // 1980-01-01, stable metadata for frozen copies.
    header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
    const central=Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(8,10);
    central.writeUInt16LE(33,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);
    central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
    local.push(header,name,compressed);directory.push(central,name);
    offset+=header.length+name.length+compressed.length;
  }
  const index=Buffer.concat(directory),end=Buffer.alloc(22),count=Object.keys(parts).length;
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(count,8);end.writeUInt16LE(count,10);
  end.writeUInt32LE(index.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,index,end]);
}

export async function createDocumentExcel(snapshot:DocumentSnapshot):Promise<Buffer> {
  const {draft,template,totals}=snapshot;
  const rows:string[]=[],merges:string[]=[];
  const text=(cell:string,value:string,style=0)=>`<c r="${cell}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
  const number=(cell:string,value:string,style=2,formula?:string)=>`<c r="${cell}" s="${style}">${formula?`<f>${xml(formula)}</f>`:""}<v>${value}</v></c>`;
  const row=(index:number,cells:string,height=22)=>rows.push(`<row r="${index}" ht="${height}" customHeight="1">${cells}</row>`);
  const band=(index:number,value:string,style=0,height=28)=>{
    row(index,text("A"+index,value,style),height);merges.push(`A${index}:F${index}`);
  };
  band(1,template.name,4,32);
  band(2,`LOCAL TEST ${snapshot.kind.toUpperCase()} · ${snapshot.reference}`,1,28);
  band(3,template.address,0,Math.max(24,template.address.split("\n").length*15));
  band(4,[template.phone,template.email].filter(Boolean).join(" · "));
  row(5,text("A5","Issue date",3)+(/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date)
    ?number("B5",String(Math.round(Date.parse(snapshot.date+"T00:00:00Z")/86400000)+25569),6):text("B5",snapshot.date))
    +text("D5","Job",3)+text("E5",snapshot.jobReference));merges.push("B5:C5","E5:F5");
  band(7,"BILL TO",1);
  band(8,draft.customer,3);
  band(9,[draft.attention,draft.customerId].filter(Boolean).join(" · "));
  band(10,draft.address,0,Math.max(24,draft.address.split("\n").length*15));
  band(11,draft.contact,0,30);
  band(13,`${snapshot.kind==="quotation"?"Valid until":"Due date"}: ${draft.deadline||"Not specified"}`);
  band(14,`Prepared by: ${template.preparedBy||"Not recorded"} · Approved by: ${snapshot.issuedBy}`);
  row(16,["Description","Quantity","Unit","Unit price ZMW","Discount ZMW","Amount ZMW"].map((label,i)=>text("ABCDEF"[i]+16,label,1)).join(""),32);
  draft.lines.forEach((line,i)=>{
    const n=17+i;
    row(n,text("A"+n,line.description)+number("B"+n,line.quantity,7)+text("C"+n,line.unit)
      +number("D"+n,line.unitPrice)+number("E"+n,line.discount||"0")
      +number("F"+n,totals.amounts[i],2,`ROUND(B${n}*D${n},2)-E${n}`),Math.max(30,Math.ceil(line.description.length/42)*16));
  });
  const last=16+draft.lines.length,sub=last+2,discount=sub+1,total=sub+2;
  row(sub,text("D"+sub,"Subtotal",3)+number("F"+sub,totals.subtotal,2,`SUM(F17:F${last})`));merges.push(`D${sub}:E${sub}`);
  row(discount,text("D"+discount,"Overall discount",3)+number("E"+discount,String(Number(draft.overallDiscount||"0")/100),5)
    +number("F"+discount,totals.discount,2,`ROUND(F${sub}*E${discount},2)`));
  row(total,text("D"+total,"TOTAL ZMW",1)+number("F"+total,totals.total,8,`F${sub}-F${discount}`),30);merges.push(`D${total}:E${total}`);
  let end=total+2;
  const paragraph=(heading:string,value:string)=>{
    if(!value)return;
    band(end++,heading,3);
    band(end++,value,0,Math.max(30,(value.split("\n").reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/115)),0))*16));
  };
  paragraph("Payment terms",draft.terms);
  paragraph("Tax treatment",template.taxNote);
  paragraph("Bank instructions",template.bankDetails);
  paragraph("Notes",draft.notes);
  if(snapshot.revisionOf)paragraph("Replaces",snapshot.revisionOf);
  band(end,"LOCAL TEST DOCUMENT · Issued portal copies remain the record of approval.",3);
  const declaration='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const main="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const sheetName=snapshot.kind==="invoice"?"Invoice":"Quotation";
  return archive({
    "[Content_Types].xml":declaration+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    "_rels/.rels":declaration+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":declaration+`<workbook xmlns="${main}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Area" localSheetId="0">'${sheetName}'!$A$1:$F$${end}</definedName><definedName name="_xlnm.Print_Titles" localSheetId="0">'${sheetName}'!$16:$16</definedName></definedNames><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
    "xl/_rels/workbook.xml.rels":declaration+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    "xl/styles.xml":declaration+`<styleSheet xmlns="${main}"><numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd"/><numFmt numFmtId="166" formatCode="General"/></numFmts><fonts count="4"><font><sz val="11"/><color rgb="FF172C45"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF172C45"/><name val="Calibri"/></font><font><b/><sz val="22"/><color rgb="FF172C45"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF173D65"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="top"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0"/><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf><xf numFmtId="164" fontId="1" fillId="2" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    "xl/worksheets/sheet1.xml":declaration+`<worksheet xmlns="${main}"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:F${end}"/><sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="16" topLeftCell="A17" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="22"/><cols>${[46,11,10,17,17,19].map((width,i)=>`<col min="${i+1}" max="${i+1}" width="${width}" customWidth="1"/>`).join("")}</cols><sheetData>${rows.join("")}</sheetData><mergeCells count="${merges.length}">${merges.map(ref=>`<mergeCell ref="${ref}"/>`).join("")}</mergeCells><printOptions horizontalCentered="1"/><pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>&amp;LLOCAL TEST DOCUMENT&amp;RPage &amp;P of &amp;N</oddFooter></headerFooter></worksheet>`,
  });
}
