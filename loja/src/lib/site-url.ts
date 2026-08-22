import "server-only";

/**
 * URL pública do site, usada nas URLs de retorno do Mercado Pago e no webhook.
 * Se NEXT_PUBLIC_SITE_URL não estiver definida, tenta resolver automaticamente
 * a partir das variáveis que o Vercel injeta sozinho — assim não é preciso
 * configurar essa variável manualmente ao publicar lá.
 */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
