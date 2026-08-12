import type { NextConfig } from "next";

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
  },
  // As páginas agregadoras com abas foram eliminadas — cada item virou rota própria
  // (ex.: /divida-ativa no lugar de /gestao-fiscal?categoria=divida-ativa). Os redirects
  // preservam bookmarks antigos e links espalhados (header, breadcrumbs).
  async redirects() {
    const categoriaParaRota: Record<string, string> = {
      "renuncia-fiscal": "/renuncias-fiscais",
      "execucao-orcamentaria": "/rreo",
      rgf: "/rgf",
      "divida-ativa": "/divida-ativa",
      inidoneas: "/empresas-inidoneas",
      glossario: "/glossario-gestao-fiscal",
      "transferencias-recebidas": "/transferencias-recebidas",
      "transferencias-realizadas": "/transferencias-realizadas",
      "acordos-firmados": "/acordos-firmados"
    };

    interface RegraRedirect {
      source: string;
      destination: string;
      permanent: boolean;
      has?: { type: "query"; key: string; value: string }[];
    }

    // /gestao-fiscal e /convenios: redireciona cada aba pra rota própria; sem
    // ?categoria (ou com valor desconhecido) cai na rota da aba padrão antiga.
    const regrasPorCategoria = (source: string, mapa: Record<string, string>): RegraRedirect[] =>
      Object.entries(mapa).map(([categoria, destino]) => ({
        source,
        has: [{ type: "query", key: "categoria", value: categoria }],
        destination: destino,
        permanent: false
      }));

    return [
      ...regrasPorCategoria("/gestao-fiscal", categoriaParaRota),
      { source: "/gestao-fiscal", destination: "/renuncias-fiscais", permanent: false },
      ...regrasPorCategoria("/convenios", categoriaParaRota),
      { source: "/convenios", destination: "/transferencias-recebidas", permanent: false }
    ];
  }
};

export default nextConfig;
