import { downloadJobFile } from "@/server/job-files";
import { requireViewer } from "@/server/session";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string; id: string }> }) {
  const { reference, id } = await params;
  const viewer = await requireViewer(["owner", "staff", "customer"], "/account");
  const file = await downloadJobFile(viewer, reference, id);
  return new Response(new Uint8Array(Buffer.from(file.body, "base64")), { headers: {
    "Content-Type": file.mime,
    "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(file.name).replace(/['()*]/g, char => "%" + char.charCodeAt(0).toString(16)),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox",
  } });
}
