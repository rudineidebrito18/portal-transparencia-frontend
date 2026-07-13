import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { planejamentoMock } from './mocks/planejamento.mock'
import { RecursoPlanejamento } from './types'

export const planejamentoService = criarServicoDocumentoGenerico<RecursoPlanejamento>(
  'planejamento',
  planejamentoMock
)
