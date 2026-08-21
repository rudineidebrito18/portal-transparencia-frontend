import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// /api/* e /users/* eram reescritos aqui via rewrites() antes da Fase 3 do plano de arquitetura
// — agora são Route Handlers (src/app/api/[...path]/route.ts, src/app/users/[...path]/route.ts)
// porque um rewrite só reescreve a URL, sem conseguir anexar o header do segredo compartilhado
// que o backend passou a exigir.
const nextConfig: NextConfig = {};

export default nextConfig;

// Dá ao `next dev` acesso aos bindings do Cloudflare (assets, env do wrangler.jsonc) do jeito
// que rodariam em produção — sem isso, `next dev` normal não vê o runtime do Workers.
initOpenNextCloudflareForDev();
