'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Page } from '@/modules/shared/types/Page'

type UsePageableResourceProps<T, F> = {
  fetchFunction: (params: F & {
    page?: number
    size?: number
    sort?: string
  }) => Promise<Page<T>>
  initialSort?: string
  size?: number
}

// 'categoria' não é um filtro de busca, é a aba ativa nas views com abas
// (ex: GestaoFiscalView) — também mora na URL, mas não deve ir pro backend.
const PARAMS_RESERVADOS = new Set(['page', 'sort', 'categoria'])

// Teto de registros buscados para exportação "tudo" (não só a página atual). Também é o
// max-page-size padrão do Spring Data — pedir mais que isso já seria truncado no backend
// mesmo, então usar o mesmo número aqui deixa o truncamento explícito e detectável
// (comparando com totalElements) em vez de silencioso.
const LIMITE_EXPORTACAO = 2000

// Página, ordenação e filtros vivem na URL (não em useState) — assim o resultado é
// compartilhável/sobrevive a um F5 e volta pro estado certo com o botão voltar do navegador.
export function usePageableResource<
  T,
  F extends object = Record<string, never>
>({
  fetchFunction,
  initialSort = "dataPublicacao,desc",
  size = 10
}: UsePageableResourceProps<T, F>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null)
  const [exportando, setExportando] = useState(false)

  const pagina = Number(searchParams.get('page') ?? 0)
  const ordenacao = searchParams.get('sort') ?? initialSort

  const filtros = {} as F
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
      sort: novaOrdenacao === initialSort ? undefined : novaOrdenacao,
      page: undefined
    })
  }

  function setFiltros(novosFiltros: F) {
    const alteracoes: Record<string, string | undefined> = { page: undefined }

    for (const chave of Object.keys(filtros)) {
      if (!(chave in novosFiltros)) alteracoes[chave] = undefined
    }

    for (const [chave, valor] of Object.entries(novosFiltros as Record<string, unknown>)) {
      alteracoes[chave] = valor === undefined || valor === null ? undefined : String(valor)
    }

    atualizarUrl(alteracoes)
  }

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setLoading(true)
      setErro(null)

      try {
        const response = await fetchFunction({
          ...filtros,
          page: pagina,
          size,
          sort: ordenacao || undefined
        })

        if (ativo) {
          setData(response.content)
          setTotalPaginas(response.totalPages)
          setTotalElements(response.totalElements)
          setAtualizadoEm(new Date())
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Erro ao carregar dados"

        if (ativo) setErro(message)
      } finally {
        if (ativo) setLoading(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), fetchFunction, size])

  // Busca o resultado inteiro dos filtros/ordenação atuais (não só a página exibida),
  // pra exportação. Um único request com size no teto — mesmo padrão de fetch da página,
  // só que sem o `pagina` da URL. `truncado` avisa quando o total real passa do teto.
  async function buscarTudoParaExportar(): Promise<{ itens: T[]; truncado: boolean }> {
    setExportando(true)

    try {
      const response = await fetchFunction({
        ...filtros,
        page: 0,
        size: LIMITE_EXPORTACAO,
        sort: ordenacao || undefined
      })

      return {
        itens: response.content,
        truncado: response.totalElements > LIMITE_EXPORTACAO
      }
    } finally {
      setExportando(false)
    }
  }

  return {
    data,
    loading,
    erro,

    pagina,
    totalPaginas,
    totalElements,
    atualizadoEm,
    setPagina,
    setFiltros,
    setOrdenacao,

    exportando,
    buscarTudoParaExportar,

    filtros,
    ordenacao
  }
}
