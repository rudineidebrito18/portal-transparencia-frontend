import Link from 'next/link'

import Breadcrumbs from '@/components/Breadcrumbs'

export default function LicitacaoNaoEncontrada() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Licitações', href: '/licitacoes' },
          { label: 'Não encontrada' }
        ]}
      />

      <div className="p-8 bg-error/10 text-error rounded-lg border border-error/20 font-bold text-center">
        Licitação não encontrada.

        <div className="mt-4">
          <Link href="/licitacoes" className="text-primary underline text-sm font-semibold">
            Voltar para a listagem
          </Link>
        </div>
      </div>
    </div>
  )
}
