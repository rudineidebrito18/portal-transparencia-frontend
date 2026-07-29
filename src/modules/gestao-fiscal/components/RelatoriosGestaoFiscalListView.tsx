'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useRelatoriosGestaoFiscal } from '../hooks/useGestaoFiscal'
import RelatorioGestaoFiscalFiltro from './RelatorioGestaoFiscalFiltro'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

export default function RelatoriosGestaoFiscalListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useRelatoriosGestaoFiscal()

  return (
    <div>
      <RelatorioGestaoFiscalFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

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
