import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { RecursoPlanejamento } from './types'

export const planejamentoService = criarServicoDocumentoGenerico<RecursoPlanejamento>(
  'planejamento'
)
