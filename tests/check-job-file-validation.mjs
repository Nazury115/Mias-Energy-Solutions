import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { FileProblem, maxFileBytes, validateJobFile } from "../src/server/validate-job-file.ts";

const pixels = { create: { width: 3, height: 2, channels: 3, background: "white" } };
const png = await sharp(pixels).png().toBuffer();
const jpeg = await sharp(pixels).jpeg().toBuffer();
const pdf = await PDFDocument.create();
pdf.addPage();
const document = Buffer.from(await pdf.save());
for (const [data, name, mime] of [[document, "sheet.pdf", "application/pdf"], [png, "pump.png", "image/png"], [jpeg, "site.JPG", "image/jpeg"]]) {
  const parsed = await validateJobFile(new File([data], name));
  assert.equal(parsed.mime, mime);
  assert.deepEqual(parsed.bytes, data);
}
// Valid trailing PDF whitespace lets both boundary cases use real documents.
const exact = Buffer.concat([document, Buffer.alloc(maxFileBytes - document.length - 6, 32), Buffer.from("%%EOF\n")]);
assert.equal((await validateJobFile(new File([exact], "limit.pdf"))).bytes.length, maxFileBytes);
for (const [data, name] of [[Buffer.alloc(0), "empty.pdf"], [Buffer.concat([exact, Buffer.from(" ")]), "oversize.pdf"],
  [png, "image.jpg"], [jpeg, "../photo.jpg"], [png, "site.html"], [png.subarray(0, 36), "broken.png"],
  [jpeg.subarray(0, jpeg.length / 2), "cut.jpg"], [Buffer.from("%PDF-1.7\ninvalid\n%%EOF"), "fake.pdf"]]) {
  await assert.rejects(validateJobFile(new File([data], name)), FileProblem, name);
}
