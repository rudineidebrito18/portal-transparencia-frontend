import { FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

// Nomes reservados da paginação/ordenação/aba — tudo que não é isso na URL é filtro. Fonte
// única usada tanto no parse server-side (Server Component lendo searchParams) quanto no hook
// client-side (useDocumentoGenericoUrlState) — evita as duas listas divergirem com o tempo.
// 'categoria' não é filtro de busca, é a aba ativa nas views com abas (Educação, Saúde) — mesmo
// motivo/nome já usado em usePageableResource.PARAMS_RESERVADOS pro padrão antigo.
export const PARAMS_RESERVADOS_GENERICO = new Set(['page', 'sort', 'categoria'])

// Server Components no App Router recebem searchParams como objeto plano (chave -> string |
// string[] | undefined), não como URLSearchParams — parse próprio, sem depender de
// next/navigation (que é client-only).
export function extrairFiltrosDeSearchParamsServidor(
  searchParams: Record<string, string | string[] | undefined>
): FiltroDocumentoGenerico {
  const filtros: Record<string, string> = {}

  for (const [chave, valor] of Object.entries(searchParams)) {
    if (PARAMS_RESERVADOS_GENERICO.has(chave)) continue
    if (typeof valor === 'string' && valor !== '') filtros[chave] = valor
  }

  return filtros as FiltroDocumentoGenerico
}
