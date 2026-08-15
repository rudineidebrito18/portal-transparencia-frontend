import ConselhoMunicipalListPage from '@/modules/admin/institucional/components/ConselhoMunicipalListPage'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoAssistenciaSocialAdminPage() {
  return (
    <ConselhoMunicipalListPage
      tipo={TipoConselho.ASSISTENCIA_SOCIAL}
      titulo={TipoConselhoDescricao[TipoConselho.ASSISTENCIA_SOCIAL]}
      basePath="/admin/institucional/conselho-assistencia-social"
    />
  )
}
