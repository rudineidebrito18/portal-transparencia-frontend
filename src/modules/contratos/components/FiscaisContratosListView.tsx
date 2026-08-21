import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { contratoService } from '../contrato.service'
import { FiltroContrato } from '../types'
import FiscaisContratosControles from './FiscaisContratosControles'
import FiscalContratoListaServidor from './FiscalContratoListaServidor'
import ContratoPaginacao from './ContratoPaginacao'

const ORDENACAO_PADRAO = 'gestorContrato,asc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
// Reprojeção do mesmo /licitacoes/contratos/filtro de Contratos, ver comentário original em
// hooks/useFiscaisContratos.ts (agora apagado).
export default async function FiscaisContratosListView({ searchParams }: Props) {
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
      <FiscaisContratosControles totalElements={resultado.totalElements} atualizadoEm={new Date().toISOString()} />

      <FiscalContratoListaServidor contratos={resultado.content} />

      <ContratoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
