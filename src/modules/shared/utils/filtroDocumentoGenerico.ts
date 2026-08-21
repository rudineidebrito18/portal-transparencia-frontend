import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

// Nomes reservados da paginação/ordenação/aba — tudo que não é isso na URL é filtro. Fonte
// única usada tanto no parse server-side (Server Component lendo searchParams) quanto no hook
// client-side (useDocumentoGenericoUrlState) — evita as duas listas divergirem com o tempo.
// 'categoria' não é filtro de busca, é a aba ativa nas views com abas (Educação, Saúde) — mesmo
// motivo/nome já usado em usePageableResource.PARAMS_RESERVADOS pro padrão antigo.
export const PARAMS_RESERVADOS_GENERICO = new Set(['page', 'sort', 'categoria'])

export function extrairFiltrosDeSearchParamsServidor(
  searchParams: Record<string, string | string[] | undefined>
): FiltroDocumentoGenerico {
  return extrairFiltrosDeSearchParams(searchParams, PARAMS_RESERVADOS_GENERICO)
}
