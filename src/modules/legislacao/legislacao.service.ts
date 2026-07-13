import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { legislacaoMock } from './mocks/legislacao.mock'

export const legislacaoService = criarServicoDocumentoGenerico<'lei'>(
  'legislacao',
  legislacaoMock
)
