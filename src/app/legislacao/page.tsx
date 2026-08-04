import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import LegislacaoListView from '@/modules/legislacao/components/LegislacaoListView'

export default function Legislacao() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Legislação" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Legislação' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <LegislacaoListView />
      </Suspense>
    </div>
  )
}
