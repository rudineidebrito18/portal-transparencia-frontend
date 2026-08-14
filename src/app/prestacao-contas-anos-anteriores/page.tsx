import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PrestacaoContasAnosAnterioresListView from '@/modules/prestacao-contas/components/PrestacaoContasAnosAnterioresListView'

export default function PrestacaoContasAnosAnteriores() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Prestação de Contas — Anos Anteriores" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Prestação de Contas — Anos Anteriores' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <PrestacaoContasAnosAnterioresListView />
      </Suspense>
    </div>
  )
}
