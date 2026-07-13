'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useRelatoriosExecucaoOrcamentaria } from '../hooks/useGestaoFiscal'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

export default function RelatoriosExecucaoOrcamentariaListView() {
  const { data, loading, erro } = useRelatoriosExecucaoOrcamentaria()

  return (
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
  )
}
