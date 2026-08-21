import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import LicitacaoListView from '@/modules/licitacoes/components/LicitacaoListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Licitacoes({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Licitações" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Licitações' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <LicitacaoListView searchParams={params} />
      </Suspense>
    </div>
  )
}
