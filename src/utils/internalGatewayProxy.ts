import { NextRequest } from 'next/server'

// Fase 3 do plano de arquitetura: fecha a API interna do backend (hoje todo GET/HEAD em
// /api/** é permitAll — qualquer um bate direto, sem passar pelo site). A partir de agora o
// único caminho legítimo é este proxy: roda no servidor (nunca no browser), anexa o segredo
// compartilhado (INTERNAL_GATEWAY_KEY, variável SEM o prefixo NEXT_PUBLIC_ — nunca pode ir pro
// bundle do cliente) e repassa a chamada pro backend real. Usado pelos catch-all
// src/app/api/[...path]/route.ts e src/app/users/[...path]/route.ts — mesmo caminho visto pelo
// browser (/api/*, /users/*) de antes, quando next.config.ts fazia isso via rewrites() (que só
// reescrevia a URL, sem anexar header nenhum).
const HEADER_GATEWAY = 'X-Internal-Gateway-Key'

// Cabeçalhos específicos da conexão cliente→Next que não fazem sentido (ou atrapalham) na
// chamada servidor→backend: host/connection são da conexão anterior; content-length e
// accept-encoding são recalculados pelo runtime na nova chamada. expect é o mais crítico dos
// quatro: clientes que mandam corpo grande (curl acima de ~1MB, por padrão) mandam
// "Expect: 100-continue" — repassar esse header pro fetch() do undici (runtime Node do `next
// dev`/local) quebra com "NotSupportedError: expect header not supported", derrubando QUALQUER
// upload grande com 500 antes mesmo de tentar (achado real testando upload de 30MB pela Fase 3).
const HEADERS_REQUISICAO_PARA_REMOVER = ['host', 'connection', 'content-length', 'accept-encoding', 'expect']

// content-encoding/content-length do backend não valem mais depois que o fetch() do proxy já
// decodifica o corpo — repassá-los sem ajuste faz o browser tentar descomprimir de novo (ou
// desconfiar do tamanho) um corpo que já chegou puro. transfer-encoding é recalculado pelo
// próprio runtime de resposta.
const HEADERS_RESPOSTA_PARA_REMOVER = ['content-encoding', 'content-length', 'transfer-encoding']

export async function proxyParaBackend(
  request: NextRequest,
  backendBaseUrl: string,
  path: string[]
): Promise<Response> {
  const destino = `${backendBaseUrl}/${path.join('/')}${request.nextUrl.search}`

  const headers = new Headers(request.headers)
  for (const nome of HEADERS_REQUISICAO_PARA_REMOVER) headers.delete(nome)
  headers.set(HEADER_GATEWAY, process.env.INTERNAL_GATEWAY_KEY ?? '')

  // GET/HEAD não podem ter corpo (fetch lança erro se body vier setado mesmo que undefined
  // funcionalmente — por segurança evita passar body nesses métodos).
  const temCorpo = request.method !== 'GET' && request.method !== 'HEAD'

  const opcoes: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    body: temCorpo ? request.body : undefined,
    // manual, não follow: endpoints como /api/storage/redirect respondem 302 pra uma URL
    // presignada do R2 DE PROPÓSITO, pro browser baixar direto do R2 (sem passar pelo Worker).
    // Com "follow" (default), o fetch() abaixo seguiria o redirect ele mesmo e devolveria o
    // ARQUIVO como se fosse a resposta original — o browser nunca veria o 302, e o download
    // passaria a consumir CPU/banda do Worker à toa.
    redirect: 'manual'
  }
  // duplex: obrigatório pelo undici (runtime Node do `next dev`/local) ao mandar um body via
  // ReadableStream — sem efeito no runtime de Workers (fetch já é streaming nativo lá), mas
  // precisa estar presente pra não quebrar em dev.
  if (temCorpo) opcoes.duplex = 'half'

  const respostaBackend = await fetch(destino, opcoes)

  const headersResposta = new Headers(respostaBackend.headers)
  for (const nome of HEADERS_RESPOSTA_PARA_REMOVER) headersResposta.delete(nome)

  return new Response(respostaBackend.body, {
    status: respostaBackend.status,
    statusText: respostaBackend.statusText,
    headers: headersResposta
  })
}
