import LicitacaoDetalhe from '@/components/licitacao/LicitacaoDetalhe'
import { licitacoesMockPage } from '@/mocks/licitacoesMock'
import { buscarLicitacao } from '@/services/licitacaoService'

export default async function LicitacaoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  let licitacao;

  try {
    licitacao = await buscarLicitacao(numericId)
  } catch {
    licitacao = undefined
  }

  if (!licitacao) {
    licitacao = licitacoesMockPage.content.find(l => l.id === numericId)
  }

  if (!licitacao) {
    return <div className="p-4">Licitação não encontrada.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <LicitacaoDetalhe licitacao={licitacao} />
    </div>
  )
}