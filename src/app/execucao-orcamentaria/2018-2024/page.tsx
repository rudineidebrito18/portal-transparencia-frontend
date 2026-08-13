import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PaginaExternaEmbutida from '@/components/ui/PaginaExternaEmbutida'

export default function ExecucaoOrcamentaria2018a2024() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (2018 a 2024)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Execução Orçamentária (2018 a 2024)' }
        ]} />

      <Suspense fallback={<Skeleton className="h-[88vh]" />}>
        <PaginaExternaEmbutida
          url="https://governotransparente.com.br/22419490"
          titulo="Execução Orçamentária (2018 a 2024)"
        />
      </Suspense>
    </div>
  )
}
