import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import FormularioEsicForm from '@/modules/esic/components/FormularioEsicForm'
import InformacoesEsicView from '@/modules/esic/components/InformacoesEsicView'

export default function Esic() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="E-SIC" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'E-SIC' }
        ]} />

      <div className="space-y-6">
        <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
          <InformacoesEsicView />
        </Suspense>

        <FormularioEsicForm />
      </div>
    </div>
  )
}
