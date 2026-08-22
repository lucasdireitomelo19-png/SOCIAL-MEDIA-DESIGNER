import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-line bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-white/60">{siteConfig.description}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Comprar</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/produtos" className="hover:text-white">
                Todas as peças
              </Link>
            </li>
            <li>
              <Link href="/carrinho" className="hover:text-white">
                Minha sacola
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Ajuda</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Siga-nos</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
