import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import RelatoriosExecucaoOrcamentariaListView from '@/modules/gestao-fiscal/components/RelatoriosExecucaoOrcamentariaListView'

export default function Rreo() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Relatório Resumido da Execução Orçamentária (RREO)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Relatório Resumido da Execução Orçamentária (RREO)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <RelatoriosExecucaoOrcamentariaListView />
      </Suspense>
    </div>
  )
}
