import ConselhoMunicipalView from '@/modules/conselho-municipal/components/ConselhoMunicipalView'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoAssistenciaSocial() {
  return <ConselhoMunicipalView tipo={TipoConselho.ASSISTENCIA_SOCIAL} titulo={TipoConselhoDescricao[TipoConselho.ASSISTENCIA_SOCIAL]} />
}
