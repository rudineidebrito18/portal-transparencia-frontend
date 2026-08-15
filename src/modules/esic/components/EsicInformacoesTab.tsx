'use client'

import { Suspense } from 'react'

import Skeleton from '@/components/ui/Skeleton'
import FormularioEsicForm from './FormularioEsicForm'
import InformacoesEsicView from './InformacoesEsicView'
import RegulamentacaoEsicListView from './RegulamentacaoEsicListView'

export default function EsicInformacoesTab() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}>
        <InformacoesEsicView />
      </Suspense>

      <FormularioEsicForm />

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary/60 mb-4">
          Regulamentação do SIC
        </h2>
        <RegulamentacaoEsicListView />
      </div>
    </div>
  )
}
