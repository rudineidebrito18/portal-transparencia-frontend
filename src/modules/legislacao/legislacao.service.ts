import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const legislacaoService = criarServicoDocumentoGenerico<'lei'>(
  'legislacao'
)
