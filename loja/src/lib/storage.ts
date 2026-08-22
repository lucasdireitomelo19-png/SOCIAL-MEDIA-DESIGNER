import "server-only";
import { mkdir, writeFile, readFile as readFileFs, unlink } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "./upload-dir";

export const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Onde as fotos de produto ficam guardadas.
 * - Rodando no Netlify: usa Netlify Blobs (funciona em serverless, sem disco persistente).
 * - Fora do Netlify (local, Railway, Docker, etc): grava em disco em UPLOAD_DIR.
 */
function isNetlify() {
  return Boolean(process.env.NETLIFY);
}

async function getBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "product-photos", consistency: "strong" });
}

export async function saveUpload(filename: string, buffer: Buffer, contentType: string): Promise<void> {
  if (isNetlify()) {
    const store = await getBlobStore();
    await store.set(filename, new Blob([new Uint8Array(buffer)]), { metadata: { contentType } });
    return;
  }
  await mkdir(/* turbopackIgnore: true */ UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);
}

export async function readUpload(
  filename: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (isNetlify()) {
    const store = await getBlobStore();
    const result = await store.getWithMetadata(filename, { type: "arrayBuffer" });
    if (!result) return null;
    const contentType = (result.metadata?.contentType as string) ?? "application/octet-stream";
    return { buffer: Buffer.from(result.data), contentType };
  }
  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return null;
  try {
    const buffer = await readFileFs(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename));
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export async function deleteUpload(filename: string): Promise<void> {
  if (isNetlify()) {
    const store = await getBlobStore();
    await store.delete(filename);
    return;
  }
  await unlink(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename)).catch(() => {});
}
