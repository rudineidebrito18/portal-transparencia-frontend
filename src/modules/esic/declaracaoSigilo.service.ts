import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { declaracaoSigiloEsicMock } from './mocks/declaracaoSigiloEsic.mock'

export const declaracaoSigiloEsicService = criarServicoDocumentoGenerico<'declaracao-sigilo'>(
  'esic',
  declaracaoSigiloEsicMock
)
