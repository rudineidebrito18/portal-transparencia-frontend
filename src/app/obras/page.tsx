import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ObrasListView from '@/modules/obras/components/ObrasListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Obras({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Obras Públicas" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Obras Públicas' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <ObrasListView searchParams={params} />
      </Suspense>
    </div>
  )
}
