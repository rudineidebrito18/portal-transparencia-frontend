import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TransferenciasRecebidasListView from '@/modules/convenios/components/TransferenciasRecebidasListView'

export default function TransferenciasRecebidasPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Convênios e Transferências Recebidas" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'Transferências Recebidas' }
      ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TransferenciasRecebidasListView />
      </Suspense>
    </div>
  )
}
