import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { documentoRHService } from '../documentoRH.service'
import { RecursoDocumentoRH } from '../types'

export const useDocumentosRH = criarUseDocumentosGenerico<RecursoDocumentoRH>(
  documentoRHService
)
