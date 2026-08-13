'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { contratoStatusLabel } from '../status'
import { useContratos } from '../hooks/useContratos'
import { ContratoLicitacao } from '../types'
import ContratoCard from './ContratoCard'
import ContratoFiltro from './ContratoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<ContratoLicitacao>[] = [
  { chave: 'numeroSequencial', rotulo: 'Nº Sequencial' },
  { chave: 'numeroContrato', rotulo: 'Nº Contrato' },
  { chave: 'exercicio', rotulo: 'Exercício' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'status', rotulo: 'Status', formatar: item => contratoStatusLabel(item.status) },
  { chave: 'objeto', rotulo: 'Objeto' },
  { chave: 'unidade', rotulo: 'Unidade' },
  { chave: 'dataInicio', rotulo: 'Vigência Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataTermino', rotulo: 'Vigência Fim', formatar: item => formatarData(item.dataTermino) },
  { chave: 'valorContrato', rotulo: 'Valor', formatar: item => formatarMoeda(item.valorContrato) }
]

export default function ContratoListView() {
  const {
    data: contratos,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    atualizadoEm,
    setPagina,
    setOrdenacao,
    ordenacao,
    filtros,
    setFiltros,
    exportando,
    buscarTudoParaExportar
  } = useContratos()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<ContratoLicitacao[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <ContratoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={contratos.length === 0 || exportando}
            aria-label="Exportar todos os resultados dos filtros aplicados"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} className={exportando ? 'animate-pulse' : ''} />
            {exportando ? 'Preparando...' : 'Exportar'}
          </button>

          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao || 'dataPublicacao,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="dataPublicacao,desc">Mais recentes</option>
            <option value="dataPublicacao,asc">Mais antigos</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {contratos.length > 0 ? (
              contratos.map(item => (
                <ContratoCard key={item.id} contrato={item} />
              ))
            ) : (
              <EmptyState message="Nenhum contrato encontrado com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}

      {/* EXPORTAÇÃO (somente os dados da página atual) */}
      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar contratos"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="contratos"
        truncado={truncadoExportar}
      />
    </div>
  )
}
