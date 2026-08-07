import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@faker-js/faker"],
  experimental: {
    // Requisições que passam pelo rewrite /api/* abaixo são clonadas e bufferizadas em
    // memória pelo Next.js, com limite padrão de 10MB — acima disso ele trunca o corpo
    // silenciosamente (sem erro), deixando o backend esperar bytes que nunca chegam até a
    // conexão cair sozinha (~30s depois). Era a causa real do "timeout" em PDFs >10MB, não
    // uma questão de banda/velocidade. Alinhado com o limite real do backend
    // (spring.servlet.multipart.max-file-size=40MB, application-dev/prod.properties) mais
    // margem pro overhead do multipart, pra deixar o Spring aplicar sua própria validação
    // em vez do Next truncar antes.
    middlewareClientMaxBodySize: "45mb"
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
