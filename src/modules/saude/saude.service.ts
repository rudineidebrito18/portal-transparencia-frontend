import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { saudeMock } from './mocks/saude.mock'
import { RecursoSaude } from './types'

export const saudeService = criarServicoDocumentoGenerico<RecursoSaude>(
  'saude',
  saudeMock
)
