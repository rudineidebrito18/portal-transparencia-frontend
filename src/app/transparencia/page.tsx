import { Metadata } from 'next'
import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import TransparenciaHub from '@/modules/transparencia/components/TransparenciaHub'

export const metadata: Metadata = {
  title: 'Transparência — Acesso à Informação',
}

export default function TransparenciaPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs items={[{ label: 'Transparência' }]} />

      <h1 className="text-3xl font-bold mb-2 text-primary uppercase">
        Acesso à Informação
      </h1>
      <div className="h-1 w-20 bg-secondary mb-8 rounded-full" />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TransparenciaHub />
      </Suspense>
    </div>
  )
}
