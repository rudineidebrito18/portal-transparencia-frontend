'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { FiltroDocumentoGenerico } from '../types/DocumentoGenerico'
import { PARAMS_RESERVADOS_GENERICO } from '../utils/filtroDocumentoGenerico'

// Fase 4: versão só-de-URL de usePageableResource, sem fetch nenhum — a busca em si passou a
// rodar no Server Component (ver DocumentoGenericoListView de cada módulo). Este hook cuida
// só da parte interativa (filtro/ordenação/página), que continua precisando de
// next/navigation (client-only) pra atualizar a URL sem perder o padrão "estado mora na URL,
// sobrevive a F5" que o app já usava. Não é um refactor de usePageableResource: aquele hook
// ainda é usado por dezenas de páginas (todo o admin, licitações, obras etc.) que não fazem
// parte desta conversão — criar um hook novo, enxuto, evita mexer num alicerce tão largo.
export function useDocumentoGenericoUrlState(ordenacaoPadrao = 'data,desc') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pagina = Number(searchParams.get('page') ?? 0)
  const ordenacao = searchParams.get('sort') ?? ordenacaoPadrao

  const filtros = {} as FiltroDocumentoGenerico
  searchParams.forEach((valor, chave) => {
    if (!PARAMS_RESERVADOS_GENERICO.has(chave)) {
      (filtros as Record<string, string>)[chave] = valor
    }
  })

  function atualizarUrl(alteracoes: Record<string, string | number | undefined>) {
    const novosParams = new URLSearchParams(searchParams.toString())

    for (const [chave, valor] of Object.entries(alteracoes)) {
      if (valor === undefined || valor === '') {
        novosParams.delete(chave)
      } else {
        novosParams.set(chave, String(valor))
      }
    }

    const query = novosParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function setPagina(novaPagina: number) {
    atualizarUrl({ page: novaPagina || undefined })
  }

  function setOrdenacao(novaOrdenacao: string) {
    atualizarUrl({
      sort: novaOrdenacao === ordenacaoPadrao ? undefined : novaOrdenacao,
      page: undefined
    })
  }

  function setFiltros(novosFiltros: FiltroDocumentoGenerico) {
    const alteracoes: Record<string, string | undefined> = { page: undefined }

    for (const chave of Object.keys(filtros)) {
      if (!(chave in novosFiltros)) alteracoes[chave] = undefined
    }

    for (const [chave, valor] of Object.entries(novosFiltros as Record<string, unknown>)) {
      alteracoes[chave] = valor === undefined || valor === null ? undefined : String(valor)
    }

    atualizarUrl(alteracoes)
  }

  return { pagina, ordenacao, filtros, setPagina, setOrdenacao, setFiltros }
}
