import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { emendasMunicipaisService } from '../emendas-municipais.service'

const useDocumentosEmendasMunicipais = criarUseDocumentosGenerico<'emenda-municipal'>(emendasMunicipaisService)

export function useEmendasMunicipais() {
  return useDocumentosEmendasMunicipais('emenda-municipal')
}
