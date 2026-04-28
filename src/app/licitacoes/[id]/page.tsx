import LicitacaoDetalhe from '@/app/licitacoes/components/LicitacaoDetalhe'
import Breadcrumbs from '@/components/Breadcrumbs'
import { buscarLicitacao } from '@/services/licitacao.service'

export default async function LicitacaoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  let licitacao

  try {
    licitacao = await buscarLicitacao(numericId)
  } catch {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumbs items={[{ label: 'Licitações', href: '/licitacoes' }, { label: 'Erro' }]} />
        <div className="p-8 bg-error/10 text-error rounded-lg border border-error/20 font-bold">
          Licitação não encontrada ou erro ao carregar dados.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs 
        items={[
          { label: 'Licitações', href: '/licitacoes' },
          { label: `${licitacao.numeroInstrumento}/${licitacao.ano}` }
        ]} 
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Detalhes da Licitação
        </h1>
        <div className="h-1.5 w-16 bg-secondary mt-2 rounded-full" />
      </div>

      <LicitacaoDetalhe licitacao={licitacao} />
    </div>
  )
}