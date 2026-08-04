import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PrestacaoContasView from '@/modules/prestacao-contas/components/PrestacaoContasView'

export default function PrestacaoContas() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Prestação de Contas" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Prestação de Contas' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <PrestacaoContasView />
      </Suspense>
    </div>
  )
}
