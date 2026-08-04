import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import GestaoFiscalView from '@/modules/gestao-fiscal/components/GestaoFiscalView'

export default function GestaoFiscal() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Gestão Fiscal" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Gestão Fiscal' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <GestaoFiscalView />
      </Suspense>
    </div>
  )
}
