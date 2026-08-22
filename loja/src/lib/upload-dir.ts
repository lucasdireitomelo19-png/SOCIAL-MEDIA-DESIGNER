import "server-only";
import path from "path";

/**
 * Onde as fotos enviadas pelo admin ficam salvas em disco.
 * Em produção, aponte UPLOAD_DIR para um caminho dentro de um volume persistente
 * (ex: Railway) — assim as fotos sobrevivem a redeploys. Sem essa variável, usa
 * public/uploads (funciona local, mas não persiste em hospedagens serverless).
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");
