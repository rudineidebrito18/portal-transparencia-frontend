import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import DiarioOficialView from '@/modules/diario-oficial/components/DiarioOficialView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DiarioOficialPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Diário Oficial" breadcrumbItems={[
          { label: 'Diário Oficial' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <DiarioOficialView searchParams={params} />
      </Suspense>
    </div>
  )
}
