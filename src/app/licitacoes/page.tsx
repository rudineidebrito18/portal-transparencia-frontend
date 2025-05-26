import LicitacaoCard from '@/components/LicitacaoCard'
import Link from 'next/link'

const licitacoes = [
  {
    id: 1,
    titulo: 'Aquisição de Materiais de Escritório',
    status: 'Aberta',
    dataAbertura: '2025-06-10',
  },
  {
    id: 2,
    titulo: 'Serviços de Limpeza Urbana',
    status: 'Encerrada',
    dataAbertura: '2025-04-15',
  },
]

export default function LicitacoesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Licitações</h1>
      <div className="grid gap-6">
        {licitacoes.map(licitacao => (
          <LicitacaoCard key={licitacao.id} licitacao={licitacao} />
        ))}
      </div>
      <Link href="/" className="mt-8 inline-block text-blue-600 hover:underline">
        ← Voltar para a página inicial
      </Link>
    </main>
  )
}
