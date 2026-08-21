import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { contratoService } from '../contrato.service'
import { FiltroContrato } from '../types'
import ContratoControles from './ContratoControles'
import ContratoListaServidor from './ContratoListaServidor'
import ContratoPaginacao from './ContratoPaginacao'

const ORDENACAO_PADRAO = 'dataPublicacao,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function ContratoListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroContrato>(searchParams, PARAMS_RESERVADOS)

  const resultado = await contratoService.listarTodosServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <ContratoControles totalElements={resultado.totalElements} atualizadoEm={new Date().toISOString()} />

      <ContratoListaServidor
        contratos={resultado.content}
        emptyMessage="Nenhum contrato encontrado com os filtros aplicados."
      />

      <ContratoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
