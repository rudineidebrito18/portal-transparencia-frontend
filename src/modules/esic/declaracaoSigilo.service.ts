import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const declaracaoSigiloEsicService = criarServicoDocumentoGenerico<'declaracao-sigilo'>(
  'esic'
)
