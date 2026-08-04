import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import DocumentosRHView from '@/modules/recursos-humanos/components/DocumentosRHView'

export default function RecursosHumanos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Recursos Humanos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Recursos Humanos' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <DocumentosRHView />
      </Suspense>
    </div>
  )
}
