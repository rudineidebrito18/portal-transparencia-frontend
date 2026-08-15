'use client'

import { useParams } from 'next/navigation'

import ConselhoMunicipalDetalhePage from '@/modules/admin/institucional/components/ConselhoMunicipalDetalhePage'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoEducacaoDetalheAdminPage() {
  const params = useParams<{ id: string }>()

  return (
    <ConselhoMunicipalDetalhePage
      tipo={TipoConselho.EDUCACAO}
      conselhoId={Number(params.id)}
      basePath="/admin/institucional/conselho-educacao"
      tituloLista={TipoConselhoDescricao[TipoConselho.EDUCACAO]}
    />
  )
}
