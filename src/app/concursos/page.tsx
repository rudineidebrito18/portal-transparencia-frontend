import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ConcursosListView from '@/modules/concursos/components/ConcursosListView'

export default function Concursos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Concursos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Concursos e seleções públicas' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <ConcursosListView />
      </Suspense>
    </div>
  )
}
