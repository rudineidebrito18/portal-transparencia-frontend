import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { competenciasService } from '../competencias.service'

const useDocumentosCompetencias = criarUseDocumentosGenerico<'competencias'>(competenciasService)

export function useCompetencias() {
  return useDocumentosCompetencias('competencias')
}
