import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import TabelaCargos from '@/modules/cargos/components/TabelaCargos'

export default function Cargos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Tabela com padrão remuneratório' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">
        Tabela com Padrão Remuneratório
      </h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>}>
        <TabelaCargos />
      </Suspense>
    </div>
  )
}
