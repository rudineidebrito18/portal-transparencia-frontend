import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import LicitantesSancionadosListView from '@/modules/licitantes-sancionados/components/LicitantesSancionadosListView'

export default function LicitantesSancionadosPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Licitantes e/ou Contratados Sancionados" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Licitantes e/ou Contratados Sancionados' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <LicitantesSancionadosListView />
      </Suspense>
    </div>
  )
}
