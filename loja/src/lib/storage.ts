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
 * Onde as fotos de produto ficam guardadas — detectado automaticamente pela plataforma:
 * - Vercel: Vercel Blob (retorna uma URL pública própria, servida direto pela CDN deles).
 * - Netlify: Netlify Blobs (servido pela nossa própria rota /api/uploads/[filename]).
 * - Fora dessas (local, Railway, Docker, etc): grava em disco em UPLOAD_DIR, também servido
 *   por /api/uploads/[filename].
 */
function isNetlify() {
  return Boolean(process.env.NETLIFY);
}

function isVercel() {
  return Boolean(process.env.VERCEL);
}

async function getNetlifyBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "product-photos", consistency: "strong" });
}

/**
 * Salva o arquivo e retorna a URL a ser guardada no banco (ProductImage.url).
 */
export async function saveUpload(
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (isVercel()) {
    const { put } = await import("@vercel/blob");
    const result = await put(filename, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return result.url;
  }

  if (isNetlify()) {
    const store = await getNetlifyBlobStore();
    await store.set(filename, new Blob([new Uint8Array(buffer)]), { metadata: { contentType } });
    return `/api/uploads/${filename}`;
  }

  await mkdir(/* turbopackIgnore: true */ UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);
  return `/api/uploads/${filename}`;
}

/**
 * Usado pela rota /api/uploads/[filename] — só é chamado para local disco e Netlify Blobs.
 * No Vercel, a URL salva já é a URL pública da CDN, servida direto (nunca passa por aqui).
 */
export async function readUpload(
  filename: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (isNetlify()) {
    const store = await getNetlifyBlobStore();
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

/**
 * Recebe a URL exatamente como está salva em ProductImage.url (pode ser uma URL absoluta
 * do Vercel Blob, ou um caminho relativo /api/uploads/... para os outros backends).
 */
export async function deleteUpload(url: string): Promise<void> {
  if (isVercel() && /^https?:\/\//.test(url)) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {});
    return;
  }

  const filename = url.replace("/api/uploads/", "");

  if (isNetlify()) {
    const store = await getNetlifyBlobStore();
    await store.delete(filename).catch(() => {});
    return;
  }

  await unlink(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename)).catch(() => {});
}
