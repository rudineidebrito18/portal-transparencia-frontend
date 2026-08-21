import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { RecursoDocumentoRH } from './types'

export const documentoRHService = criarServicoDocumentoGenerico<RecursoDocumentoRH>(
  'recursos-humanos'
)
