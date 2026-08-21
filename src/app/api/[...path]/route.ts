import { NextRequest } from 'next/server'

import { proxyParaBackend } from '@/utils/internalGatewayProxy'

// Substitui o antigo rewrites() de "/api/:path*" em next.config.ts (Fase 3 do plano de
// arquitetura). Diferença essencial: roda no servidor de verdade, então consegue anexar o
// segredo compartilhado antes de repassar pro backend — um rewrite só reescreve a URL, não tem
// como injetar header nenhum. Mesmo caminho /api/* visto pelo browser, nenhuma chamada
// existente no frontend precisa mudar (src/services/api.ts continua usando baseURL "/api").
type Contexto = { params: Promise<{ path: string[] }> }

async function handler(request: NextRequest, { params }: Contexto): Promise<Response> {
  const { path } = await params
  return proxyParaBackend(request, process.env.NEXT_PUBLIC_API_URL!, path)
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS
}
