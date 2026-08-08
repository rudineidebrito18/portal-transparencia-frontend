import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import FiscaisContratosListView from '@/modules/contratos/components/FiscaisContratosListView'

export default function FiscaisContratosPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Fiscais de Contratos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Fiscais de Contratos' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <FiscaisContratosListView />
      </Suspense>
    </div>
  )
}
