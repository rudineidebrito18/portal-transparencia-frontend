import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@faker-js/faker"],
  experimental: {
    // O proxy de rewrites() do Next tem timeout fixo de 30s (hardcoded em
    // next/dist/server/lib/router-utils/proxy-request.js) — estourava em upload de PDF
    // grande (13MB+ já reproduz, 6MB passa), mesmo o backend respondendo em <1s quando
    // testado direto — o gargalo é só esse timeout do proxy, não performance real.
    proxyTimeout: 300000
  },
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
