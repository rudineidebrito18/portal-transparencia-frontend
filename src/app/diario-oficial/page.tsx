import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import DiarioOficialListView from '@/modules/diario-oficial/components/DiarioOficialListView'
import UltimaEdicaoDestaque from '@/modules/diario-oficial/components/UltimaEdicaoDestaque'

export default function DiarioOficialPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Diário Oficial' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Diário Oficial</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <Suspense fallback={<Skeleton className="h-28 mb-6" />}>
        <UltimaEdicaoDestaque />
      </Suspense>

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <DiarioOficialListView />
      </Suspense>
    </div>
  )
}
