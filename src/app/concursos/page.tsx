import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import ConcursosListView from '@/modules/concursos/components/ConcursosListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Concursos({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Concursos" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Concursos' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <ConcursosListView searchParams={params} />
      </Suspense>
    </div>
  )
}
