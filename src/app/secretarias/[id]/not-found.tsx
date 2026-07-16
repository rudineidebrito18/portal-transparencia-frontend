import Link from 'next/link'

import Breadcrumbs from '@/components/Breadcrumbs'

export default function SecretariaNaoEncontrada() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: 'Secretarias', href: '/secretarias' },
          { label: 'Não encontrada' }
        ]}
      />

      <div className="p-8 bg-error/10 text-error rounded-lg border border-error/20 font-bold text-center">
        Secretaria não encontrada.

        <div className="mt-4">
          <Link href="/secretarias" className="text-primary underline text-sm font-semibold">
            Voltar para a listagem
          </Link>
        </div>
      </div>
    </div>
  )
}
