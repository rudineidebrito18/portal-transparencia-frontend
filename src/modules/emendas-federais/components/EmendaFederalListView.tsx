import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { emendaFederalService } from '../emendaFederal.service'
import { FiltroEmendaFederal } from '../types'
import EmendaFederalControles from './EmendaFederalControles'
import EmendaFederalListaServidor from './EmendaFederalListaServidor'
import EmendaFederalPaginacao from './EmendaFederalPaginacao'

const ORDENACAO_PADRAO = 'atualizadoEm,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function EmendaFederalListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroEmendaFederal>(searchParams, PARAMS_RESERVADOS)

  const resultado = await emendaFederalService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <EmendaFederalControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <EmendaFederalListaServidor emendas={resultado.content} />

      <EmendaFederalPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
