'use client'

import { useParams } from 'next/navigation'

import ConselhoMunicipalDetalhePage from '@/modules/admin/institucional/components/ConselhoMunicipalDetalhePage'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoAssistenciaSocialDetalheAdminPage() {
  const params = useParams<{ id: string }>()

  return (
    <ConselhoMunicipalDetalhePage
      tipo={TipoConselho.ASSISTENCIA_SOCIAL}
      conselhoId={Number(params.id)}
      basePath="/admin/institucional/conselho-assistencia-social"
      tituloLista={TipoConselhoDescricao[TipoConselho.ASSISTENCIA_SOCIAL]}
    />
  )
}
