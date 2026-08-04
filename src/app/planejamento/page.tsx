import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PlanejamentoView from '@/modules/planejamento/components/PlanejamentoView'

export default function Planejamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Planejamento" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Planejamento' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <PlanejamentoView />
      </Suspense>
    </div>
  )
}
