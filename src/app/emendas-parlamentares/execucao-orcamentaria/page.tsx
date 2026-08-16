import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import PaginaExternaEmbutida from '@/components/ui/PaginaExternaEmbutida'

export default function ExecucaoOrcamentariaEmendasParlamentares() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (Emendas Parlamentares)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas federais', href: '/emendas-federais' },
          { label: 'Execução orçamentária' }
        ]} />

      <Suspense fallback={<Skeleton className="h-[88vh]" />}>
        <PaginaExternaEmbutida
          url="https://www.governotransparente.com.br/acessoinfo/22419483/consultaremendas?clean=false"
          titulo="Execução Orçamentária (Emendas Parlamentares)"
        />
      </Suspense>
    </div>
  )
}
