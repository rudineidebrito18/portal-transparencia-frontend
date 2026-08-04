import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { execucaoOrcamentariaMock } from './mocks/execucaoOrcamentaria.mock'

export const execucaoOrcamentariaService = criarServicoDocumentoGenerico<'transferencia-voluntaria'>(
  'execucao-orcamentaria',
  execucaoOrcamentariaMock
)
