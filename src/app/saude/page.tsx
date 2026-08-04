import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import SaudeView from '@/modules/saude/components/SaudeView'

export default function Saude() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Saúde" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Saúde' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <SaudeView />
      </Suspense>
    </div>
  )
}
