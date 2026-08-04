import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import FiscalContratoListView from '@/modules/fiscal-contrato/components/FiscalContratoListView'

export default function FiscalContrato() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Fiscal de Contrato" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Fiscal de contrato' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <FiscalContratoListView />
      </Suspense>
    </div>
  )
}
