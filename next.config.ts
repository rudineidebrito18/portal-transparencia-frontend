import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@faker-js/faker"],
  images: {
    // picsum.photos só é usado no mock local (NEXT_PUBLIC_USE_MOCK=true) para simular
    // fotos de notícias — imagens reais do backend passam pelo rewrite /api/* abaixo,
    // que é same-origin e não precisa de remotePatterns.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }]
  },
  async rewrites() {
    // /users/* fica fora do prefixo /api no backend (login, seção 1 do
    // prompt-frontend-dashboard-admin.md) — reescreve pra raiz do backend
    // em vez de reaproveitar a regra de /api acima.
    const backendRoot = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      },
      {
        source: "/users/:path*",
        destination: `${backendRoot}/users/:path*`
      }
    ];
  }
};

export default nextConfig;

// Dá ao `next dev` acesso aos bindings do Cloudflare (assets, env do wrangler.jsonc) do jeito
// que rodariam em produção — sem isso, `next dev` normal não vê o runtime do Workers.
initOpenNextCloudflareForDev();
