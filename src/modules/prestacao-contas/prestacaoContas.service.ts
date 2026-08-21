import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { RecursoPrestacaoContas } from './types'

export const prestacaoContasService = criarServicoDocumentoGenerico<RecursoPrestacaoContas>(
  'prestacao-contas'
)
