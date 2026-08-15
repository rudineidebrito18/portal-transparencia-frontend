import ConselhoMunicipalListPage from '@/modules/admin/institucional/components/ConselhoMunicipalListPage'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoEducacaoAdminPage() {
  return (
    <ConselhoMunicipalListPage
      tipo={TipoConselho.EDUCACAO}
      titulo={TipoConselhoDescricao[TipoConselho.EDUCACAO]}
      basePath="/admin/institucional/conselho-educacao"
    />
  )
}
