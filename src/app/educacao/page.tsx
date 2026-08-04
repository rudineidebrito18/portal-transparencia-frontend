import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EducacaoView from '@/modules/educacao/components/EducacaoView'

export default function Educacao() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Educação" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Educação' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <EducacaoView />
      </Suspense>
    </div>
  )
}
