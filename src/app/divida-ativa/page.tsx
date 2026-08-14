import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmpresasDividaAtivaListView from '@/modules/gestao-fiscal/components/EmpresasDividaAtivaListView'

export default function DividaAtiva() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Empresas com Dívida Ativa" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Empresas com Dívida Ativa' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EmpresasDividaAtivaListView />
      </Suspense>
    </div>
  )
}
