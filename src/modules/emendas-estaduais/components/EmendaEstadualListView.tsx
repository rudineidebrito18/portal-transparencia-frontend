import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { emendaEstadualService } from '../emendaEstadual.service'
import { FiltroEmendaEstadual } from '../types'
import EmendaEstadualControles from './EmendaEstadualControles'
import EmendaEstadualListaServidor from './EmendaEstadualListaServidor'
import EmendaEstadualPaginacao from './EmendaEstadualPaginacao'

const ORDENACAO_PADRAO = 'atualizadoEm,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function EmendaEstadualListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroEmendaEstadual>(searchParams, PARAMS_RESERVADOS)

  const resultado = await emendaEstadualService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <EmendaEstadualControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <EmendaEstadualListaServidor emendas={resultado.content} />

      <EmendaEstadualPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
