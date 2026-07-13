import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { educacaoMock } from './mocks/educacao.mock'
import { RecursoEducacao } from './types'

export const educacaoService = criarServicoDocumentoGenerico<RecursoEducacao>(
  'educacao',
  educacaoMock
)
