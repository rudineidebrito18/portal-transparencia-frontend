'use client'

import { useLicitacoes } from '@/hooks/useLicitacoes'
import { FiltroLicitacao } from '@/interfaces/licitacao/Licitacao'

import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

export default function LicitacaoFiltroClient() {
  const {
    licitacoes,
    loading,
    paginaAtual,
    totalPaginas,
    filtros,
    carregarLicitacoes,
    setFiltros
  } = useLicitacoes({}, 5) // tamanho da página 5

  // Ao alterar filtros
  function handleFiltrar(novosFiltros: FiltroLicitacao) {
    setFiltros(novosFiltros)
    carregarLicitacoes(novosFiltros, 0) // sempre reinicia na página 0
  }

  // Navegação de página
  function mudarPagina(novaPagina: number) {
    if (novaPagina >= 0 && novaPagina < totalPaginas) {
      carregarLicitacoes(filtros, novaPagina)
    }
  }

  return (
    <div>
      <LicitacaoFiltro onFiltrar={handleFiltrar} />

      {loading ? (
        <p className="text-center text-text-secondary">Carregando licitações...</p>
      ) : (
        <>
          <div className="grid gap-4 mt-4">
            {licitacoes.map(item => (
              <LicitacaoCard key={item.id} licitacao={item} />
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Anterior
              </button>

              <span>
                Página {paginaAtual + 1} de {totalPaginas}
              </span>

              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual + 1 >= totalPaginas}
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