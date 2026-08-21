import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import DiariaListView from '@/modules/diarias/components/DiariaListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Diarias({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Diárias" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Diárias' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}>
        <DiariaListView searchParams={params} />
      </Suspense>
    </div>
  )
}
