import Link from 'next/link'

import Breadcrumbs from '@/components/Breadcrumbs'

export default function ContratoNaoEncontrado() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Contratos administrativos', href: '/contratos' },
          { label: 'Não encontrado' }
        ]}
      />

      <div className="p-8 bg-error/10 text-error rounded-lg border border-error/20 font-bold text-center">
        Contrato não encontrado.

        <div className="mt-4">
          <Link href="/contratos" className="text-primary underline text-sm font-semibold">
            Voltar para a listagem
          </Link>
        </div>
      </div>
    </div>
  )
}
