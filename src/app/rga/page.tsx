import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import RgaListView from '@/modules/planejamento/components/RgaListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Rga({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Relatório de Gestão ou Atividade (RGA)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Relatório de Gestão ou Atividade (RGA)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <RgaListView searchParams={params} />
      </Suspense>
    </div>
  )
}
