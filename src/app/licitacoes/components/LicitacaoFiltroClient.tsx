'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { listarLicitacoes } from '@/services/licitacao.service'

import { FiltroLicitacao, Licitacao } from '@/interfaces/licitacao/Licitacao'

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
    setOrdenacao
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

  return (
    <div>
      <LicitacaoFiltro onFiltrar={handleFiltrar} />
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-text-secondary">
          {totalElements} resultados
        </span>

        <select
          onChange={(e) => setOrdenacao(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Ordenar por</option>
          <option value="dataPublicacao,desc">Mais recentes</option>
          <option value="dataPublicacao,asc">Mais antigos</option>
        </select>
      </div>

      {erro && (
        <p className="text-center text-red-500">
          {erro}
        </p>
      )}

      {loading ? (
        <p className="text-center text-text-secondary">
          Carregando licitações...
        </p>
      ) : (
        <>
          <div className="grid gap-4 mt-4">
            {licitacoes.map(item => (
              <LicitacaoCard key={item.id} licitacao={item} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => mudarPagina(pagina - 1)}
                disabled={pagina === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Anterior
              </button>

              <span>
                Página {pagina + 1} de {totalPaginas}
              </span>

              <button
                onClick={() => mudarPagina(pagina + 1)}
                disabled={pagina + 1 >= totalPaginas}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}