import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import RelatoriosGestaoFiscalListView from '@/modules/gestao-fiscal/components/RelatoriosGestaoFiscalListView'

export default function RgfPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Relatório de Gestão Fiscal (RGF)" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'RGF' }
      ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <RelatoriosGestaoFiscalListView />
      </Suspense>
    </div>
  )
}
