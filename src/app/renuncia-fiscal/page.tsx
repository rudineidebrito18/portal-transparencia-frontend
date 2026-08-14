import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import RenunciaFiscalListView from '@/modules/gestao-fiscal/components/RenunciaFiscalListView'

export default function RenunciaFiscal() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Renúncias Fiscais" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Renúncias Fiscais' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <RenunciaFiscalListView />
      </Suspense>
    </div>
  )
}
