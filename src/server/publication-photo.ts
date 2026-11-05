import sharp from "sharp";

export async function preparePublicationPhoto(file: File): Promise<Buffer> {
  if (!file.size || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose a non-empty JPEG or PNG up to 5 MiB.");
  }
  const image = sharp(Buffer.from(await file.arrayBuffer()), {
    limitInputPixels: 40_000_000,
    failOn: "warning",
  });
  const { format } = await image.metadata();
  if (format !== "jpeg" && format !== "png") throw new Error("Choose a JPEG or PNG.");
  // Sharp omits EXIF and other source metadata unless explicitly asked to retain it.
  return image.rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}
