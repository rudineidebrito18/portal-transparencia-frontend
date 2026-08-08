import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import AditivosGlobalListView from '@/modules/contratos/components/AditivosGlobalListView'

export default function AditivosContratosPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Aditivos de Contratos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Aditivos de Contratos' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <AditivosGlobalListView />
      </Suspense>
    </div>
  )
}
