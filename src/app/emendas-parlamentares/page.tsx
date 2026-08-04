import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmendaParlamentarListView from '@/modules/emendas-parlamentares/components/EmendaParlamentarListView'

export default function EmendasParlamentares() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Emendas Parlamentares" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas parlamentares' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <EmendaParlamentarListView />
      </Suspense>
    </div>
  )
}
