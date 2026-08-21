// Fase 4 do plano de arquitetura: fetch server-side pra Server Components. Só pode ser
// importado de Server Components ou Route Handlers, NUNCA de um 'use client' — diferente do
// proxy em internalGatewayProxy.ts (que existe pra repassar a chamada do BROWSER pro backend),
// aqui quem chama já está rodando no servidor (dentro do mesmo Worker/processo Node), então
// anexa o segredo de gateway direto, sem precisar de mais um salto de rede pelo Route Handler
// /api/* — esse hop faz sentido só quando quem inicia a chamada é o browser.
const HEADER_GATEWAY = 'X-Internal-Gateway-Key'

interface BackendFetchOptions {
  // `object`, não Record<string, ...>: os DTOs de params (ex.: ListarParams) são interfaces
  // concretas sem index signature — TS recusa atribuir uma interface a um Record estrutural
  // mesmo quando os valores batem. object aceita qualquer um deles; o valor de cada campo é
  // lido via Object.entries (não depende de index signature em runtime).
  params?: object
  // Segundos de cache do Next.js Data Cache pra ESSA chamada específica (uma entrada por
  // combinação de URL+params) — mais adequado que `export const revalidate` de página inteira
  // pra uma listagem cuja URL muda a cada página/filtro/ordenação da paginação.
  revalidateSegundos?: number
}

export async function backendFetch<T>(path: string, options: BackendFetchOptions = {}): Promise<T> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${path}`)

  if (options.params) {
    for (const [chave, valor] of Object.entries(options.params as Record<string, unknown>)) {
      if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor))
    }
  }

  const response = await fetch(url, {
    headers: { [HEADER_GATEWAY]: process.env.INTERNAL_GATEWAY_KEY ?? '' },
    next: { revalidate: options.revalidateSegundos ?? 60 }
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${path}: ${response.status}`)
  }

  return response.json() as Promise<T>
}
