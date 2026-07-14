import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { documentoRHMock } from './mocks/documentoRH.mock'
import { RecursoDocumentoRH } from './types'

export const documentoRHService = criarServicoDocumentoGenerico<RecursoDocumentoRH>(
  'recursos-humanos',
  documentoRHMock
)
