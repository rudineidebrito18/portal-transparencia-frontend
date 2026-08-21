import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { obraService } from '../obra.service'
import { FiltroObraPublica } from '../types'
import ObraControles from './ObraControles'
import ObraListaServidor from './ObraListaServidor'
import ObraPaginacao from './ObraPaginacao'

const ORDENACAO_PADRAO = 'numero,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function ObrasListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroObraPublica>(searchParams, PARAMS_RESERVADOS)

  const resultado = await obraService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  // filtros vem de searchParams (sempre string em runtime, apesar do tipo declarar boolean) —
  // comparação por string, mesmo valor que a URL carrega (?paralisada=true).
  const paralisada = (filtros as unknown as Record<string, string>).paralisada === 'true'

  return (
    <div>
      <ObraControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ObraListaServidor obras={resultado.content} paralisada={paralisada} />

      <ObraPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
