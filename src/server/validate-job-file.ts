import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export class FileProblem extends Error {}
export const maxFileBytes = 5 * 1024 * 1024;

export async function validateJobFile(file: File) {
  if (!file.size || file.size > maxFileBytes) throw new FileProblem("Choose a non-empty file of 5 MiB or less.");
  const name = file.name.normalize("NFC");
  if (name.length > 160 || /[\\/\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(name)) throw new FileProblem("Use a shorter filename without path or control characters.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = name.split(".").pop()?.toLowerCase();
  try {
    if (extension === "pdf" && bytes.subarray(0, 5).toString() === "%PDF-" && /%%EOF\s*$/.test(bytes.subarray(-1024).toString("latin1"))) {
      const pdf = await PDFDocument.load(bytes, { throwOnInvalidObject: true, updateMetadata: false });
      if (pdf.getPageCount() > 0) return { name, bytes, mime: "application/pdf" };
    } else if (extension && ["jpg", "jpeg", "png"].includes(extension)) {
      const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" });
      const { format } = await image.metadata();
      if (format === (extension === "png" ? "png" : "jpeg")) {
        // Decode image data too. Reading only the header accepts truncated images.
        await image.stats();
        return { name, bytes, mime: "image/" + format };
      }
    }
  } catch { /* Use the same visitor-facing error for unsupported or corrupt data. */ }
  throw new FileProblem("Choose a valid JPEG, PNG or unencrypted PDF with a matching filename.");
}
