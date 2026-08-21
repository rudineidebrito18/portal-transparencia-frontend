'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { FiltroConteudoInstitucional } from '../types'

const PARAMS_RESERVADOS = new Set(['page', 'sort'])

// Fase 4: versão só-de-URL de usePageableResource, sem fetch — mesma ideia de
// useDocumentoGenericoUrlState (shared/hooks/), mas pro shape de FiltroConteudoInstitucional
// (título/dataInicial/dataFinal, sem exercício/categoria). usePageableResource em si não foi
// tocado — avisos continua nele, só notícias migrou pra Server Component.
export function useConteudoInstitucionalUrlState(ordenacaoPadrao = 'data,desc') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pagina = Number(searchParams.get('page') ?? 0)
  const ordenacao = searchParams.get('sort') ?? ordenacaoPadrao

  const filtros = {} as FiltroConteudoInstitucional
  searchParams.forEach((valor, chave) => {
    if (!PARAMS_RESERVADOS.has(chave)) {
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

  function setFiltros(novosFiltros: FiltroConteudoInstitucional) {
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
