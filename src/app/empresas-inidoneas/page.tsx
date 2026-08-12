import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmpresasInidoneasListView from '@/modules/gestao-fiscal/components/EmpresasInidoneasListView'

export default function EmpresasInidoneasPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Empresas Inidôneas e Suspensas" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'Empresas Inidôneas e Suspensas' }
      ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EmpresasInidoneasListView />
      </Suspense>
    </div>
  )
}
