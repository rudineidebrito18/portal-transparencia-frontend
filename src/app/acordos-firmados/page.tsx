import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import AcordosFirmadosListView from '@/modules/convenios/components/AcordosFirmadosListView'

export default function AcordosFirmadosPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Acordos Firmados pelo Órgão" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'Acordos Firmados pelo Órgão' }
      ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <AcordosFirmadosListView />
      </Suspense>
    </div>
  )
}
