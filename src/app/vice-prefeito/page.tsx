import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import VicePrefeitoView from '@/modules/prefeitura/components/VicePrefeitoView'

export default function VicePrefeito() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Vice-Prefeito Municipal" breadcrumbItems={[
          { label: 'A Prefeitura' },
          { label: 'Vice-Prefeito' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}>
        <VicePrefeitoView />
      </Suspense>
    </div>
  )
}
