import { Suspense } from 'react'

import Breadcrumbs from '@/components/Breadcrumbs'
import Skeleton from '@/components/ui/Skeleton'
import SecretariasListView from '@/modules/secretarias/components/SecretariasListView'

export default function Secretarias() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs items={[{ label: 'Secretarias' }]} />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Secretarias</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <SecretariasListView />
      </Suspense>
    </div>
  )
}
