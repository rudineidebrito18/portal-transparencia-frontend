import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import InformacoesEsicView from '@/modules/esic/components/InformacoesEsicView'

export default function Esic() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'E-SIC' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">E-SIC</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
        <InformacoesEsicView />
      </Suspense>
    </div>
  )
}
