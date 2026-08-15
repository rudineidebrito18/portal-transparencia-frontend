import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { regulamentacaoEsicMock } from './mocks/regulamentacaoEsic.mock'

export const regulamentacaoEsicService = criarServicoDocumentoGenerico<'regulamentacao'>(
  'esic',
  regulamentacaoEsicMock
)
