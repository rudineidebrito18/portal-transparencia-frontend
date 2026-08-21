import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EstagiariosListView from '@/modules/recursos-humanos/components/EstagiariosListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Estagiarios({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Estagiários" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Estagiários' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EstagiariosListView searchParams={params} />
      </Suspense>
    </div>
  )
}
