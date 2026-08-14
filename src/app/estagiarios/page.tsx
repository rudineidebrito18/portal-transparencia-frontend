import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EstagiariosListView from '@/modules/recursos-humanos/components/EstagiariosListView'

export default function Estagiarios() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Estagiários" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Estagiários' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EstagiariosListView />
      </Suspense>
    </div>
  )
}
