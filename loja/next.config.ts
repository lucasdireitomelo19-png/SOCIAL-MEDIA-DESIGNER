import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto enviadas pelo admin, quando hospedado no Vercel, ficam no Vercel Blob
    // (URL pública própria, fora do domínio do site).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
