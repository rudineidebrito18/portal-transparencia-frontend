import { extrairFiltrosDeSearchParams } from '@/utils/searchParams'
import { diarioOficialService } from '../diario-oficial.service'
import { FiltroEdicaoDiario } from '../types'
import EdicaoDiarioControles from './EdicaoDiarioControles'
import EdicaoDiarioListaServidor from './EdicaoDiarioListaServidor'
import EdicaoDiarioPaginacao from './EdicaoDiarioPaginacao'

const ORDENACAO_PADRAO = 'dataPublicacao,desc'
const TAMANHO_PAGINA = 10
const PARAMS_RESERVADOS = new Set(['page', 'sort', 'categoria'])

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4 (parcial): Server Component — mesma ideia de CompetenciasListView (padrão de
// referência), mas unificando os dois modos que já existiam no fetchFunction de
// useEdicoesDiario (client, agora removido): sem termo, listagem estruturada (cache normal,
// pensado pra SEO da página-base); com termo, busca por palavra-chave no Meilisearch (cache
// bem mais curto — ver buscarPorTextoServidor). Resultado de busca não é algo que valha a pena
// indexar por query, mas ainda ganha SSR (HTML pronto), só sem o mesmo ganho de cache.
export default async function DiarioOficialListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParams<FiltroEdicaoDiario>(searchParams, PARAMS_RESERVADOS)
  const termoAtivo = (filtros.termo ?? '').trim()

  const params = { ...filtros, page: pagina, size: TAMANHO_PAGINA, sort }
  const resultado = termoAtivo
    ? await diarioOficialService.buscarPorTextoServidor(params)
    : await diarioOficialService.listarServidor(params)

  return (
    <div className="space-y-6">
      <EdicaoDiarioControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <EdicaoDiarioListaServidor itens={resultado.content} termoAtivo={Boolean(termoAtivo)} />

      <EdicaoDiarioPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
