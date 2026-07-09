import { notFound } from 'next/navigation'

import Breadcrumbs from '@/components/Breadcrumbs'
import { TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from '@/modules/licitacoes/enums'
import { licitacaoService } from '@/modules/licitacoes/licitacao.service'
import LicitacaoDetalhe from '@/modules/licitacoes/components/LicitacaoDetalhe'

export default async function LicitacaoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isFinite(numericId)) notFound()

  let licitacao
  try {
    licitacao = await licitacaoService.buscarPorId(numericId)
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound()
    throw error
  }

  const tipoLabel =
    TipoProcedimentoDescricao[licitacao.tipoProcedimentoLicitacao as TipoProcedimentoLicitacao] ||
    licitacao.tipoProcedimentoLicitacao

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Licitações', href: '/licitacoes' },
          { label: `${tipoLabel} Nº ${licitacao.numeroInstrumento}/${licitacao.ano}` }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes da Licitação
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <LicitacaoDetalhe id={numericId} licitacao={licitacao} />
    </div>
  )
}
