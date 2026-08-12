import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ValidarEdicaoView from '@/modules/diario-oficial/components/ValidarEdicaoView'

// Rota de verificação de autenticidade — o QR Code impresso na última página de cada
// edição aponta para /diario/validar/{numero} (app.diario.validacao.url-base no backend).
export default async function ValidarEdicaoPage({
  params
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  const numeroEdicao = Number(numero)

  if (!Number.isFinite(numeroEdicao)) notFound()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PageHeader
        title="Verificar autenticidade"
        breadcrumbItems={[
          { label: 'Diário Oficial', href: '/diario-oficial' },
          { label: `Verificar edição Nº ${numeroEdicao}` }
        ]}
      />

      <Suspense fallback={<Skeleton className="h-64" />}>
        <ValidarEdicaoView numero={numeroEdicao} />
      </Suspense>
    </div>
  )
}
