import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const execucaoOrcamentariaService = criarServicoDocumentoGenerico<'transferencia-voluntaria'>(
  'execucao-orcamentaria'
)
