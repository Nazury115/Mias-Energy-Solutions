import { publicationImage } from "@/server/publishing";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const body=await publicationImage(id);
  return new Response(new Uint8Array(body),{headers:{"Content-Type":"image/jpeg","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
