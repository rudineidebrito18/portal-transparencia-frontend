import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { noticiaService } from '../institucional.service'
import { FiltroConteudoInstitucional } from '../types'
import ConteudoInstitucionalControles from './ConteudoInstitucionalControles'
import ConteudoInstitucionalListaServidor from './ConteudoInstitucionalListaServidor'
import ConteudoInstitucionalPaginacao from './ConteudoInstitucionalPaginacao'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de CompetenciasListView (padrão de referência), só que
// pro shape de ConteudoInstitucional (sem exportar, sem exercício). `ativo: true` é fixo aqui,
// igual já era no useNoticias antigo — o público só vê conteúdo ativo, não é um filtro do usuário.
export default async function NoticiasListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroConteudoInstitucional>(searchParams, PARAMS_RESERVADOS)

  const resultado = await noticiaService.listarServidor({
    ...filtros,
    ativo: true,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <ConteudoInstitucionalControles
        variant="noticia"
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ConteudoInstitucionalListaServidor
        itens={resultado.content}
        variant="noticia"
        emptyMessage="Nenhuma notícia publicada no momento."
      />

      <ConteudoInstitucionalPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
