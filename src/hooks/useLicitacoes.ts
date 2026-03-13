import { FiltroLicitacao, Licitacao } from '@/interfaces/licitacao/Licitacao'
import { gerarMockPaginado } from '@/mocks/licitacoesMockGenerator'
import { listarLicitacoes } from '@/services/licitacaoService'
import { useEffect, useState } from 'react'

interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
}

export function useLicitacoes(initialFiltros?: FiltroLicitacao, tamanhoPagina: number = 10) {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [filtros, setFiltros] = useState<FiltroLicitacao>(initialFiltros || {})

  useEffect(() => {
    carregarLicitacoes(filtros, 0)
  }, [])

  async function carregarLicitacoes(novosFiltros?: FiltroLicitacao, pagina: number = 0) {
    setLoading(true)
    try {
      const filtrosParaUsar = novosFiltros || filtros

      // Monta query params
      const query = new URLSearchParams()
      Object.entries(filtrosParaUsar).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, v.toString())
        }
      })
      query.append('page', pagina.toString())
      query.append('size', tamanhoPagina.toString())

      // Faz fetch da API
      const res = await listarLicitacoes(query.toString())

      // Se API não retornar, usa mock gerado
      const data: Page<Licitacao> = res || gerarMockPaginado(pagina, tamanhoPagina, 50)

      setLicitacoes(data.content)
      setTotalPaginas(data.totalPages)
      setPaginaAtual(pagina)
      setFiltros(filtrosParaUsar)
    } catch (error: unknown) {
      console.warn('API indisponível, usando mock paginado')

      const mock = gerarMockPaginado(pagina, tamanhoPagina, 50)
      setLicitacoes(mock.content)
      setTotalPaginas(mock.totalPages)

      if (error instanceof Error) {
        setErro(error.message)
      } else {
        setErro('Erro inesperado ao carregar licitações')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    licitacoes,
    loading,
    erro,
    paginaAtual,
    totalPaginas,
    filtros,
    carregarLicitacoes,
    setFiltros
  }
}