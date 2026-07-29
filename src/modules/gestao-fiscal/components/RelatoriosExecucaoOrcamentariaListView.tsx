'use client'

import AsyncList from '@/components/ui/AsyncList'
import Pagination from '@/components/ui/Pagination'
import { useRelatoriosExecucaoOrcamentaria } from '../hooks/useGestaoFiscal'
import RelatorioExecucaoOrcamentariaFiltro from './RelatorioExecucaoOrcamentariaFiltro'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

export default function RelatoriosExecucaoOrcamentariaListView() {
  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = useRelatoriosExecucaoOrcamentaria()

  return (
    <div>
      <RelatorioExecucaoOrcamentariaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

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
          />
        )}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
    </div>
  )
}
