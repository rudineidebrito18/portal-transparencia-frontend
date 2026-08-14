import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import JulgamentoContasTceListView from '@/modules/prestacao-contas/components/JulgamentoContasTceListView'

export default function JulgamentoContasTce() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Julgamento de Contas pelo TCE" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Julgamento de Contas pelo TCE' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <JulgamentoContasTceListView />
      </Suspense>
    </div>
  )
}
