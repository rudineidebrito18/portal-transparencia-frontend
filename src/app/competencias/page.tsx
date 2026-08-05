import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import CompetenciasListView from '@/modules/competencias/components/CompetenciasListView'

export default function Competencias() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Competências" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Competências' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <CompetenciasListView />
      </Suspense>
    </div>
  )
}
