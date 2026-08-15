import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { declaracaoSolicitacoesEsicMock } from './mocks/declaracaoSolicitacoesEsic.mock'

export const declaracaoSolicitacoesEsicService = criarServicoDocumentoGenerico<'declaracao-solicitacoes'>(
  'esic',
  declaracaoSolicitacoesEsicMock
)
