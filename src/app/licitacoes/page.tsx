import LicitacaoFiltroClient from '@/components/licitacao/LicitacaoFiltroClient'

export default function Licitacoes() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <h1 className="text-3xl font-bold mb-4">Licitações</h1>
      <LicitacaoFiltroClient />
    </div>
  )
}
