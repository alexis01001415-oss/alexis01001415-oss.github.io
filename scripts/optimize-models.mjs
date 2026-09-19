/**
 * Recompress embedded warehouse textures while leaving Draco geometry untouched.
 * Run: node scripts/optimize-models.mjs
 * The raw export is retained in artifacts/warehouse-journey.raw.glb. Repeated runs
 * use that original, so JPEG loss never accumulates. A new Blender export without
 * the optimization marker becomes the new retained raw export.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public/models/warehouse-journey.glb');
const originalPath = path.join(root, 'artifacts/warehouse-journey.raw.glb');
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const align4 = (length) => (length + 3) & ~3;

function parseGLB(file) {
  assert.equal(file.readUInt32LE(0), 0x46546c67, 'Expected GLB magic');
  assert.equal(file.readUInt32LE(4), 2, 'Expected glTF 2');
  assert.equal(file.readUInt32LE(8), file.length, 'Invalid GLB total length');
  let cursor = 12;
  let json;
  let bin;
  while (cursor < file.length) {
    const length = file.readUInt32LE(cursor);
    const type = file.readUInt32LE(cursor + 4);
    assert.equal(length % 4, 0, 'Chunks must align to four bytes');
    assert(cursor + 8 + length <= file.length, 'Chunk exceeds file boundary');
    const data = file.subarray(cursor + 8, cursor + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'));
    else if (type === 0x004e4942) bin = data;
    else throw new Error(`Unsupported GLB chunk ${type}`);
    cursor += length + 8;
  }
  assert(json && bin, 'Both JSON and BIN chunks are required');
  assert.equal(json.buffers.length, 1, 'Only a single embedded buffer is supported');
  assert(!json.buffers[0].uri, 'An embedded GLB buffer is required');
  assert(json.buffers[0].byteLength <= bin.length);
  for (const view of json.bufferViews) {
    assert.equal(view.buffer, 0);
    assert((view.byteOffset ?? 0) + view.byteLength <= bin.length);
  }
  return { json, bin };
}

function viewBytes(asset, index) {
  const view = asset.json.bufferViews[index];
  return asset.bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
}

function serializeGLB(json, bin) {
  const jsonData = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.alloc(align4(jsonData.length), 0x20);
  jsonData.copy(jsonChunk);
  const output = Buffer.alloc(12 + 8 + jsonChunk.length + 8 + bin.length);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(jsonChunk.length, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  jsonChunk.copy(output, 20);
  const binOffset = 20 + jsonChunk.length;
  output.writeUInt32LE(bin.length, binOffset);
  output.writeUInt32LE(0x004e4942, binOffset + 4);
  bin.copy(output, binOffset + 8);
  return output;
}

let original = await fs.readFile(target);
const current = parseGLB(original);
const previous = current.json.asset.extras?.duanorTextureOptimization;
if (previous) {
  original = await fs.readFile(originalPath);
  assert.equal(sha256(original), previous.originalSha256, 'Raw backup does not match the current optimized model');
} else {
  await fs.mkdir(path.dirname(originalPath), { recursive: true });
  await fs.writeFile(originalPath, original);
}
const source = parseGLB(original);
const json = structuredClone(source.json);
const normalImages = new Set();
const packedImages = new Set();
for (const material of json.materials ?? []) {
  if (material.normalTexture) normalImages.add(json.textures[material.normalTexture.index].source);
  if (material.pbrMetallicRoughness?.metallicRoughnessTexture) {
    packedImages.add(json.textures[material.pbrMetallicRoughness.metallicRoughnessTexture.index].source);
  }
  if (material.occlusionTexture) packedImages.add(json.textures[material.occlusionTexture.index].source);
}
const replacements = new Map();
const images = [];
for (const [index, image] of json.images.entries()) {
  assert(Number.isInteger(image.bufferView), 'Only embedded images are supported');
  const before = viewBytes(source, image.bufferView);
  const metadata = await sharp(before).metadata();
  const dataTexture = normalImages.has(index) || packedImages.has(index);
  const quality = normalImages.has(index) ? 87 : packedImages.has(index) ? 82 : 80;
  // Preserve independent RGB channels in normal and ARM maps. Color textures can
  // use chroma subsampling. Keep full 1024px dimensions and preserve alpha if any.
  const candidate = metadata.hasAlpha
    ? await sharp(before).png({ compressionLevel: 9 }).toBuffer()
    : await sharp(before).jpeg({ quality, chromaSubsampling: dataTexture ? '4:4:4' : '4:2:0', mozjpeg: true }).toBuffer();
  const after = candidate.length < before.length ? candidate : before;
  const resultMetadata = await sharp(after).metadata();
  assert.equal(resultMetadata.width, metadata.width);
  assert.equal(resultMetadata.height, metadata.height);
  assert.equal(resultMetadata.hasAlpha, metadata.hasAlpha);
  if (after !== before) image.mimeType = metadata.hasAlpha ? 'image/png' : 'image/jpeg';
  replacements.set(image.bufferView, after);
  images.push({ name: image.name, before: before.length, after: after.length, width: metadata.width, height: metadata.height, quality: after === before ? 'original retained' : quality, chroma: dataTexture ? '4:4:4' : '4:2:0' });
}

const parts = [];
let byteOffset = 0;
for (const [index, view] of json.bufferViews.entries()) {
  const bytes = replacements.get(index) ?? viewBytes(source, index);
  view.byteOffset = byteOffset;
  view.byteLength = bytes.length;
  parts.push(bytes);
  const padding = align4(bytes.length) - bytes.length;
  if (padding) parts.push(Buffer.alloc(padding));
  byteOffset += bytes.length + padding;
}
const bin = Buffer.concat(parts);
json.buffers[0].byteLength = bin.length;
json.asset.extras = {
  ...json.asset.extras,
  duanorTextureOptimization: {
    version: 1,
    originalSha256: sha256(original),
    description: 'Embedded JPEG optimization; original dimensions; 4:4:4 normal and ARM maps; Draco geometry preserved byte for byte.',
  },
};
const output = serializeGLB(json, bin);
const verified = parseGLB(output);
assert.deepEqual(verified.json.accessors, source.json.accessors, 'Accessors must not change');
assert.deepEqual(verified.json.meshes, source.json.meshes, 'Geometry references must not change');
assert.deepEqual(verified.json.nodes, source.json.nodes, 'Scene nodes must not change');
assert.deepEqual(verified.json.materials, source.json.materials, 'Materials must not change');
assert.deepEqual(verified.json.extensionsRequired, source.json.extensionsRequired, 'No new runtime extensions');
let geometryViewsVerified = 0;
for (const [index, view] of verified.json.bufferViews.entries()) {
  assert.equal(view.byteOffset % 4, 0, 'Buffer views must be four-byte aligned');
  if (!replacements.has(index)) {
    assert.equal(sha256(viewBytes(verified, index)), sha256(viewBytes(source, index)), `Non-image buffer view ${index} changed`);
    geometryViewsVerified += 1;
  }
}
assert(output.length < original.length, 'Optimization did not reduce size');
await fs.writeFile(target, output);
assert.equal(sha256(await fs.readFile(target)), sha256(output), 'Written output differs');
console.log(JSON.stringify({ target, rawBackup: originalPath, before: original.length, after: output.length, savedBytes: original.length - output.length, reductionPercent: Number(((1 - output.length / original.length) * 100).toFixed(2)), geometryViewsVerified, images }, null, 2));
