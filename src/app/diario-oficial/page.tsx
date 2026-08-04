import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import DiarioOficialListView from '@/modules/diario-oficial/components/DiarioOficialListView'
import UltimaEdicaoDestaque from '@/modules/diario-oficial/components/UltimaEdicaoDestaque'

export default function DiarioOficialPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Diário Oficial" breadcrumbItems={[
          { label: 'Diário Oficial' }
        ]} />

      <Suspense fallback={<Skeleton className="h-28 mb-6" />}>
        <UltimaEdicaoDestaque />
      </Suspense>

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <DiarioOficialListView />
      </Suspense>
    </div>
  )
}
