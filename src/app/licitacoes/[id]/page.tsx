import LicitacaoDetalhe from '@/app/licitacoes/components/LicitacaoDetalhe'
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
    return <div className="p-4">Licitação não encontrada.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <LicitacaoDetalhe licitacao={licitacao} />
    </div>
  )
}