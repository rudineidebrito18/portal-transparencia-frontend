import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ConveniosView from '@/modules/convenios/components/ConveniosView'

export default function Convenios() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Convênios e Transferências" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Convênios e Transferências' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <ConveniosView />
      </Suspense>
    </div>
  )
}
