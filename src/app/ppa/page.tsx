import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PpaListView from '@/modules/planejamento/components/PpaListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Ppa({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Plano Plurianual (PPA)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Plano Plurianual (PPA)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <PpaListView searchParams={params} />
      </Suspense>
    </div>
  )
}
