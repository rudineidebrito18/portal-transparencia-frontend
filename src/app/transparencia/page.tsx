import { Metadata } from 'next'
import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TransparenciaHub from '@/modules/transparencia/components/TransparenciaHub'

export const metadata: Metadata = {
  title: 'Transparência — Acesso à Informação',
}

export default function TransparenciaPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader
        title="Acesso à Informação"
        breadcrumbItems={[{ label: 'Transparência' }]}
      />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TransparenciaHub />
      </Suspense>
    </div>
  )
}
