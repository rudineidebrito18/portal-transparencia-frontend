import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PlanoEstrategicoListView from '@/modules/planejamento/components/PlanoEstrategicoListView'

export default function PlanoEstrategico() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Plano Estratégico Institucional (PEI)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Plano Estratégico Institucional (PEI)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <PlanoEstrategicoListView />
      </Suspense>
    </div>
  )
}
