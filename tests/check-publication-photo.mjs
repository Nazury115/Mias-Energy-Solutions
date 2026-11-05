import assert from "node:assert/strict";
import sharp from "sharp";
import { preparePublicationPhoto } from "../src/server/publication-photo.ts";

const original = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "white" } })
  .jpeg().withMetadata().toBuffer();
assert.ok((await sharp(original).metadata()).exif);
const result = await preparePublicationPhoto(new File([original], "original.jpg"));
const metadata = await sharp(result).metadata();
assert.equal(metadata.format, "jpeg");
assert.equal(metadata.width, 1600);
assert.equal(metadata.height, 800);
assert.equal(metadata.exif, undefined);
for (const file of [new File([], "empty.png"), new File(["pretend"], "fake.png"),
  new File([Buffer.alloc(5 * 1024 * 1024 + 1)], "large.png")]) {
  await assert.rejects(preparePublicationPhoto(file));
}
