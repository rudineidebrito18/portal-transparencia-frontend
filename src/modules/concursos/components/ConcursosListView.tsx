import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { concursoService } from '../concurso.service'
import { FiltroConcurso } from '../types'
import ConcursoControles from './ConcursoControles'
import ConcursoListaServidor from './ConcursoListaServidor'
import ConcursoPaginacao from './ConcursoPaginacao'

const ORDENACAO_PADRAO = 'dataAbertura,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de LicitacaoListView (padrão de referência).
export default async function ConcursosListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroConcurso>(searchParams, PARAMS_RESERVADOS)

  const resultado = await concursoService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div>
      <ConcursoControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ConcursoListaServidor concursos={resultado.content} />

      <ConcursoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
