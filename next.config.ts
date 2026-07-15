import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@faker-js/faker"],
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
