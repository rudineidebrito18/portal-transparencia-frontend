import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TabelaValoresListView from '@/modules/tabela-valores/components/TabelaValoresListView'

export default function TabelaValores() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Tabela de Valores das Diárias" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Tabela de Valores das Diárias' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TabelaValoresListView />
      </Suspense>
    </div>
  )
}
