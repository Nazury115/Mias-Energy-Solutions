import { publicationImage } from "@/server/publishing";
import { requireViewer } from "@/server/session";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const viewer=await requireViewer(["staff","owner"],"/staff/content");
  const {id}=await params;
  const body=await publicationImage(id,viewer);
  return new Response(new Uint8Array(body),{headers:{"Content-Type":"image/jpeg","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
