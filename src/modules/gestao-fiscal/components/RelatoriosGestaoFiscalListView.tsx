'use client'

import { MdSwapVert } from 'react-icons/md'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useRelatoriosGestaoFiscal } from '../hooks/useGestaoFiscal'
import RelatorioGestaoFiscalFiltro from './RelatorioGestaoFiscalFiltro'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

export default function RelatoriosGestaoFiscalListView() {
  const {
    data, loading, erro, pagina, totalPaginas, totalElements, setPagina, filtros, setFiltros, ordenacao, setOrdenacao
  } = useRelatoriosGestaoFiscal()

  return (
    <div>
      <RelatorioGestaoFiscalFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> relatórios encontrados
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'ano,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="ano,desc">Mais recentes</option>
            <option value="ano,asc">Mais antigos</option>
          </select>
        </div>
      </div>

      <AsyncList
        data={data}
        loading={loading}
        erro={erro}
        emptyMessage="Nenhum Relatório de Gestão Fiscal encontrado."
        renderItem={relatorio => (
          <RelatorioMultiFormatoCard
            key={relatorio.id}
            titulo={`Relatório de Gestão Fiscal - ${relatorio.periodo}`}
            subtitulo={String(relatorio.ano)}
            caminhoPdf={relatorio.caminhoPdf}
            caminhoWord={relatorio.caminhoWord}
            caminhoXls={relatorio.caminhoXls}
          />
        )}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
