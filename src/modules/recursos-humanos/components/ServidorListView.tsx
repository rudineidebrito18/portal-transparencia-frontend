import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { servidorService } from '../servidor.service'
import { FiltroServidor } from '../types'
import ServidorControles from './ServidorControles'
import ServidorListaServidor from './ServidorListaServidor'
import ServidorPaginacao from './ServidorPaginacao'

const ORDENACAO_PADRAO = 'name,asc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function ServidorListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroServidor>(searchParams, PARAMS_RESERVADOS)

  const resultado = await servidorService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <ServidorControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ServidorListaServidor servidores={resultado.content} />

      <ServidorPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
