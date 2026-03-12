import LicitacaoDetalhe from '@/components/licitacao/LicitacaoDetalhe'
import { licitacoesMock } from '@/mocks/licitacoesMock'
import { listarLicitacoes } from '@/services/licitacaoService'

export default async function LicitacaoPage({
  params
}: {
  params: { id: string }
}) {

  const { id } = params

  let licitacoes = []

  try {
    const dados = await listarLicitacoes()

    licitacoes = dados?.length ? dados : licitacoesMock
  } catch {
    licitacoes = licitacoesMock
  }

  const licitacao = licitacoes.find(
    (l) => l.id === Number(id)
  )

  if (!licitacao) {
    return (
      <div className="p-4">
        Licitação não encontrada.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <LicitacaoDetalhe licitacao={licitacao} />
    </div>
  )
}