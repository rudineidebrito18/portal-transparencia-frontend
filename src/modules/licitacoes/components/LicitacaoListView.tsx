import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { licitacaoService } from '../licitacao.service'
import { FiltroLicitacao } from '../types'
import LicitacaoControles from './LicitacaoControles'
import LicitacaoListaServidor from './LicitacaoListaServidor'
import LicitacaoPaginacao from './LicitacaoPaginacao'

const ORDENACAO_PADRAO = 'dataPublicacao,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de CompetenciasListView/NoticiasListView (padrão de
// referência), pro shape de LicitacaoResumo/FiltroLicitacao (filtro/card/export bespoke, sem
// componente compartilhado — ver plano de arquitetura).
export default async function LicitacaoListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroLicitacao>(searchParams, PARAMS_RESERVADOS)

  const resultado = await licitacaoService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <LicitacaoControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <LicitacaoListaServidor licitacoes={resultado.content} />

      <LicitacaoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
