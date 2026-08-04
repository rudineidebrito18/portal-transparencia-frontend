import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ContratoListView from '@/modules/contratos/components/ContratoListView'

export default function Contratos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Contratos Administrativos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Contratos administrativos' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <ContratoListView />
      </Suspense>
    </div>
  )
}
