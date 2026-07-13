import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { saudeService } from '../saude.service'
import { RecursoSaude } from '../types'

export const useDocumentosSaude = criarUseDocumentosGenerico<RecursoSaude>(
  saudeService
)
