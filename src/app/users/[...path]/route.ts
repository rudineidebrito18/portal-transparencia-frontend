import { NextRequest } from 'next/server'

import { proxyParaBackend } from '@/utils/internalGatewayProxy'

// Substitui o antigo rewrites() de "/users/:path*" em next.config.ts (Fase 3 do plano de
// arquitetura) — ver comentário irmão em src/app/api/[...path]/route.ts. /users/* fica fora do
// prefixo /api no backend (login, "/users/test", etc.), por isso o base URL aqui é a raiz do
// backend, não process.env.NEXT_PUBLIC_API_URL diretamente.
type Contexto = { params: Promise<{ path: string[] }> }

const backendRoot = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '')

async function handler(request: NextRequest, { params }: Contexto): Promise<Response> {
  const { path } = await params
  return proxyParaBackend(request, backendRoot, path)
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
