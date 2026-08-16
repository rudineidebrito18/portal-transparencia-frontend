import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmendasMunicipaisListView from '@/modules/emendas-municipais/components/EmendasMunicipaisListView'

export default function EmendasMunicipais() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Emendas Municipais" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas Municipais' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EmendasMunicipaisListView />
      </Suspense>
    </div>
  )
}
