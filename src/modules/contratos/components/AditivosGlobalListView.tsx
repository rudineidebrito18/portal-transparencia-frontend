import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { contratoService } from '../contrato.service'
import { FiltroContrato } from '../types'
import AditivosGlobalControles from './AditivosGlobalControles'
import ContratoListaServidor from './ContratoListaServidor'
import ContratoPaginacao from './ContratoPaginacao'

const ORDENACAO_PADRAO = 'dataAssinatura,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência). Lista
// contratos que têm pelo menos um aditivo (não os aditivos soltos) — ver comentário original em
// contrato.service.ts (listarComAditivos).
export default async function AditivosGlobalListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroContrato>(searchParams, PARAMS_RESERVADOS)

  const resultado = await contratoService.listarComAditivosServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <AditivosGlobalControles totalElements={resultado.totalElements} atualizadoEm={new Date().toISOString()} />

      <ContratoListaServidor
        contratos={resultado.content}
        emptyMessage="Nenhum contrato com aditivo encontrado."
      />

      <ContratoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
