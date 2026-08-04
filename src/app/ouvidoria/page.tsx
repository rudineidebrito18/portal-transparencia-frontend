import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import FormularioOuvidoriaForm from '@/modules/ouvidoria/components/FormularioOuvidoriaForm'
import InformacoesOuvidoriaView from '@/modules/ouvidoria/components/InformacoesOuvidoriaView'

export default function Ouvidoria() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Ouvidoria" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Ouvidoria' }
        ]} />

      <div className="space-y-6">
        <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
          <InformacoesOuvidoriaView />
        </Suspense>

        <FormularioOuvidoriaForm />
      </div>
    </div>
  )
}
