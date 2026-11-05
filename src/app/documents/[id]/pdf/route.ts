import { unstable_rethrow } from "next/navigation";
import { commercialPdf } from "@/server/commercial-documents";
import { requireViewer } from "@/server/session";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const staff=new URL(request.url).searchParams.get("portal")==="staff";
  const viewer=await requireViewer(staff?["owner","staff"]:["customer","owner","staff"],staff?"/staff/documents/"+id:"/account/documents/"+id);
  try {
    const file=await commercialPdf(staff?viewer:{...viewer,role:"customer"},id);
    return new Response(new Uint8Array(file.bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${file.name}.pdf"`,
      "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch(error) {unstable_rethrow(error);return new Response("The PDF could not be created. Review the saved draft.",{status:400,headers:{"Cache-Control":"private, no-store"}});}
}
