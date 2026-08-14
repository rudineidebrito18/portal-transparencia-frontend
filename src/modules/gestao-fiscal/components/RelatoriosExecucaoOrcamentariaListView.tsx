'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useRelatoriosExecucaoOrcamentaria } from '../hooks/useGestaoFiscal'
import { RelatorioExecucaoOrcamentaria } from '../types'
import RelatorioExecucaoOrcamentariaFiltro from './RelatorioExecucaoOrcamentariaFiltro'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

const COLUNAS_EXPORTACAO: ColunaExportacao<RelatorioExecucaoOrcamentaria>[] = [
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'bimestre', rotulo: 'Bimestre' },
  { chave: 'ano', rotulo: 'Ano' }
]

export default function RelatoriosExecucaoOrcamentariaListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, atualizadoEm, setPagina, filtros, setFiltros, ordenacao, setOrdenacao,
    exportando, buscarTudoParaExportar
  } = useRelatoriosExecucaoOrcamentaria()
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<RelatorioExecucaoOrcamentaria[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    const resultado = await buscarTudoParaExportar()
    setItensExportar(resultado.itens)
    setTruncadoExportar(resultado.truncado)
    setExportarAberto(true)
  }

  return (
    <div>
      <RelatorioExecucaoOrcamentariaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> relatórios encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={data.length === 0 || exportando}
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
            value={ordenacao || 'ano,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="ano,desc">Mais recentes</option>
            <option value="ano,asc">Mais antigos</option>
          </Select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhum relatório de execução orçamentária encontrado."
        renderItem={relatorio => (
          <RelatorioMultiFormatoCard
            key={relatorio.id}
            titulo={relatorio.descricao}
            subtitulo={`${relatorio.bimestre}º Bimestre de ${relatorio.ano}`}
            caminhoPdf={relatorio.caminhoPdf}
            caminhoWord={relatorio.caminhoWord}
            caminhoXls={relatorio.caminhoXls}
            origem={{ label: 'Relatório Resumido da Execução Orçamentária', href: '/rreo' }}
          />
        )}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar relatórios de execução orçamentária"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="rreo"
        truncado={truncadoExportar}
      />
    </div>
  )
}
