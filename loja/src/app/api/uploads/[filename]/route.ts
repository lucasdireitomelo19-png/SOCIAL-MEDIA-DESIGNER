import { NextRequest, NextResponse } from "next/server";
import { readUpload } from "@/lib/storage";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Evita path traversal: só aceita nomes de arquivo simples, sem separadores de diretório.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return NextResponse.json({ error: "Nome de arquivo inválido." }, { status: 400 });
  }

  const file = await readUpload(filename);
  if (!file) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
