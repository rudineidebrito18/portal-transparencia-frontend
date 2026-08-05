import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PrefeitoView from '@/modules/prefeitura/components/PrefeitoView'

export default function Prefeito() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Prefeito Municipal" breadcrumbItems={[
          { label: 'A Prefeitura' },
          { label: 'Prefeito' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}>
        <PrefeitoView />
      </Suspense>
    </div>
  )
}
