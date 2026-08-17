import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmendaEstadualListView from '@/modules/emendas-estaduais/components/EmendaEstadualListView'

export default function EmendasEstaduais() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Emendas Estaduais" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas estaduais' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <EmendaEstadualListView />
      </Suspense>
    </div>
  )
}
