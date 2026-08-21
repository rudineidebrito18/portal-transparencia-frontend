import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import NoticiasListView from '@/modules/institucional/components/NoticiasListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NoticiasPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Notícias" breadcrumbItems={[
          { label: 'Notícias' }
        ]} />

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>}>
        <NoticiasListView searchParams={params} />
      </Suspense>
    </div>
  )
}
