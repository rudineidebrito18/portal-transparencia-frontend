'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { listarLicitacoes } from '@/services/licitacao.service'

import { FiltroLicitacao, Licitacao } from '@/interfaces/licitacao/Licitacao'

import { MdSwapVert } from 'react-icons/md'
import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

export default function LicitacaoFiltroClient() {
  const {
    data: licitacoes,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    setPagina,
    setFiltros,
    setOrdenacao,
    ordenacao
  } = usePageableResource<Licitacao, FiltroLicitacao>({
    fetchFunction: listarLicitacoes,
    size: 10
  })

  function handleFiltrar(novosFiltros: FiltroLicitacao) {
    setFiltros(novosFiltros)
    setPagina(0)
  }

  function mudarPagina(novaPagina: number) {
    setPagina(novaPagina)
  }

  // 🔥 GERA PAGINAÇÃO INTELIGENTE
  function gerarPaginas() {
    const paginas: (number | string)[] = []

    const inicio = Math.max(0, pagina - 2)
    const fim = Math.min(totalPaginas - 1, pagina + 2)

    if (inicio > 0) {
      paginas.push(0)
      if (inicio > 1) paginas.push('...')
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i)
    }

    if (fim < totalPaginas - 1) {
      if (fim < totalPaginas - 2) paginas.push('...')
      paginas.push(totalPaginas - 1)
    }

    return paginas
  }

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <LicitacaoFiltro onFiltrar={handleFiltrar} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'dataPublicacao,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="dataPublicacao,desc">Mais recentes</option>
            <option value="dataPublicacao,asc">Mais antigos</option>
          </select>
        </div>

      </div>

      {/* ERRO */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
          {erro}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-neutral-light animate-pulse rounded-xl border border-border/30"
            />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {licitacoes.length > 0 ? (
              licitacoes.map(item => (
                <LicitacaoCard key={item.id} licitacao={item} />
              ))
            ) : (
              <div className="bg-white border border-border/30 rounded-xl p-8 text-center shadow-sm">
                <p className="text-text-secondary">
                  Nenhuma licitação encontrada com os filtros aplicados.
                </p>
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPaginas > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 bg-white border border-border/30 rounded-xl px-4 md:px-5 py-3 shadow-sm">

              <span className="text-sm text-text-secondary">
                Página <strong>{pagina + 1}</strong> de <strong>{totalPaginas}</strong>
              </span>

              <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-thin">

                <button
                  onClick={() => mudarPagina(pagina - 1)}
                  disabled={pagina === 0}
                  className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition whitespace-nowrap"
                >
                  Anterior
                </button>

                {gerarPaginas().map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="px-2 text-text-secondary text-sm">...</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => mudarPagina(p as number)}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition whitespace-nowrap
                        ${p === pagina
                          ? 'bg-primary text-white'
                          : 'hover:bg-neutral-light text-text-secondary'
                        }`}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                )}

                <button
                  onClick={() => mudarPagina(pagina + 1)}
                  disabled={pagina + 1 >= totalPaginas}
                  className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition whitespace-nowrap"
                >
                  Próxima
                </button>

              </div>

            </div>
          )}
        </>
      )}
    </div>
  )
}