'use client'

import AsyncList from '@/components/ui/AsyncList'
import { useRelatoriosGestaoFiscal } from '../hooks/useGestaoFiscal'
import RelatorioMultiFormatoCard from './RelatorioMultiFormatoCard'

export default function RelatoriosGestaoFiscalListView() {
  const { data, loading, erro } = useRelatoriosGestaoFiscal()

  return (
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
  )
}
