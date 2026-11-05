import { unstable_rethrow } from "next/navigation";
import { commercialDownload } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params,query=new URL(request.url).searchParams;
  const staff=query.get("portal")==="staff",format=query.get("format");
  const viewer=await requireViewer(staff?["owner","staff"]:["customer","owner","staff"],staff?"/staff/documents/"+id:"/account/documents/"+id);
  if(format!=="pdf"&&format!=="xlsx")return new Response("Choose PDF or Excel.",{status:400,headers:{"Cache-Control":"private, no-store"}});
  try {
    const file=await commercialDownload(staff?viewer:{...viewer,role:"customer"},id,format);
    return new Response(new Uint8Array(file.bytes),{headers:{
      "Content-Type":format==="pdf"?"application/pdf":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":`attachment; filename="${file.name}.${format}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch(error) {
    unstable_rethrow(error);
    return new Response("The document could not be created. Review the saved draft.",{status:400,headers:{"Cache-Control":"private, no-store"}});
  }
}
