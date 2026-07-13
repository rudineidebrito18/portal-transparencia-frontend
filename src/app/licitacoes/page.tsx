import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import LicitacaoListView from '@/modules/licitacoes/components/LicitacaoListView'

export default function Licitacoes() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Licitações' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Licitações</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <LicitacaoListView />
      </Suspense>
    </div>
  )
}
