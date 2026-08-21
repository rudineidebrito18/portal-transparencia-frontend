import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const declaracaoSolicitacoesEsicService = criarServicoDocumentoGenerico<'declaracao-solicitacoes'>(
  'esic'
)
