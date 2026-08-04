import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TabelaCargos from '@/modules/cargos/components/TabelaCargos'

export default function Cargos() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Tabela com Padrão Remuneratório" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Tabela com padrão remuneratório' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>}>
        <TabelaCargos />
      </Suspense>
    </div>
  )
}
