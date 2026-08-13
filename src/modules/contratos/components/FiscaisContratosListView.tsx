'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useFiscaisContratos } from '../hooks/useFiscaisContratos'
import { ContratoLicitacao } from '../types'
import FiscalContratoCard from './FiscalContratoCard'
import FiscalContratoFiltro from './FiscalContratoFiltro'

const COLUNAS_EXPORTACAO: ColunaExportacao<ContratoLicitacao>[] = [
  { chave: 'gestorContrato', rotulo: 'Nome do Fiscal' },
  { chave: 'numeroContrato', rotulo: 'Nº Contrato' },
  { chave: 'exercicio', rotulo: 'Exercício' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'dataAssinatura', rotulo: 'Assinatura', formatar: item => formatarData(item.dataAssinatura) },
  { chave: 'dataInicio', rotulo: 'Vigência Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataTermino', rotulo: 'Vigência Fim', formatar: item => formatarData(item.dataTermino) },
  { chave: 'unidade', rotulo: 'Unidade' }
]

export default function FiscaisContratosListView() {
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
  } = useFiscaisContratos()
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

      <FiscalContratoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> contratos encontrados
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
            value={ordenacao || 'gestorContrato,asc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="gestorContrato,asc">Nome do Fiscal (A-Z)</option>
            <option value="gestorContrato,desc">Nome do Fiscal (Z-A)</option>
            <option value="dataAssinatura,desc">Assinatura mais recente</option>
            <option value="dataAssinatura,asc">Assinatura mais antiga</option>
          </Select>
        </div>

      </div>

      {erro && <ErrorState message={erro} />}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {contratos.length > 0 ? (
              contratos.map(contrato => (
                <FiscalContratoCard key={contrato.id} contrato={contrato} />
              ))
            ) : (
              <EmptyState message="Nenhum contrato encontrado com os filtros aplicados." />
            )}
          </div>

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar fiscais de contrato"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="fiscais-contratos"
        truncado={truncadoExportar}
      />
    </div>
  )
}
