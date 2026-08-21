import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import LdoListView from '@/modules/planejamento/components/LdoListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Ldo({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Lei de Diretrizes Orçamentárias (LDO)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Lei de Diretrizes Orçamentárias (LDO)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <LdoListView searchParams={params} />
      </Suspense>
    </div>
  )
}
