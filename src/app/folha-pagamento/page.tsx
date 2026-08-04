import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import FolhaPagamentoMesView from '@/modules/recursos-humanos/components/FolhaPagamentoMesView'

export default function FolhaPagamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Folha de Pagamento" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Folha de Pagamento' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>}>
        <FolhaPagamentoMesView />
      </Suspense>
    </div>
  )
}
