import ConselhoMunicipalView from '@/modules/conselho-municipal/components/ConselhoMunicipalView'
import { TipoConselho, TipoConselhoDescricao } from '@/modules/conselho-municipal/types'

export default function ConselhoEducacao() {
  return <ConselhoMunicipalView tipo={TipoConselho.EDUCACAO} titulo={TipoConselhoDescricao[TipoConselho.EDUCACAO]} />
}
