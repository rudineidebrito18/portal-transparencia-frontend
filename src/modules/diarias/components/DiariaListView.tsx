import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { diariaService } from '../diaria.service'
import { FiltroDiaria } from '../types'
import DiariaControles from './DiariaControles'
import DiariaListaServidor from './DiariaListaServidor'
import DiariaPaginacao from './DiariaPaginacao'

const ORDENACAO_PADRAO = 'dataInicio,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function DiariaListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroDiaria>(searchParams, PARAMS_RESERVADOS)

  const resultado = await diariaService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <DiariaControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <DiariaListaServidor diarias={resultado.content} />

      <DiariaPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
