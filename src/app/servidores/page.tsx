import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ServidorListView from '@/modules/recursos-humanos/components/ServidorListView'

export default function Servidores() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Servidores" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Servidores' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <ServidorListView />
      </Suspense>
    </div>
  )
}
