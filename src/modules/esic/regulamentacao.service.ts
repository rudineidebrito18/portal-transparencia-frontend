import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const regulamentacaoEsicService = criarServicoDocumentoGenerico<'regulamentacao'>(
  'esic'
)
