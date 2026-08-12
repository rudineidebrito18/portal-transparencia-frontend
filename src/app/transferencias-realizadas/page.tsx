import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TransferenciasRealizadasListView from '@/modules/convenios/components/TransferenciasRealizadasListView'

export default function TransferenciasRealizadasPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Convênios e Transferências Realizadas" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'Transferências Realizadas' }
      ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TransferenciasRealizadasListView />
      </Suspense>
    </div>
  )
}
