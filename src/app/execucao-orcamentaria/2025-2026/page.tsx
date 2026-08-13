import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PaginaExternaEmbutida from '@/components/ui/PaginaExternaEmbutida'

export default function ExecucaoOrcamentaria2025a2026() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (2025 a 2026)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Execução Orçamentária (2025 a 2026)' }
        ]} />

      <Suspense fallback={<Skeleton className="h-[88vh]" />}>
        <PaginaExternaEmbutida
          url="https://www.governotransparente.com.br/22419483"
          titulo="Execução Orçamentária (2025 a 2026)"
        />
      </Suspense>
    </div>
  )
}
