import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { prestacaoContasMock } from './mocks/prestacaoContas.mock'
import { RecursoPrestacaoContas } from './types'

export const prestacaoContasService = criarServicoDocumentoGenerico<RecursoPrestacaoContas>(
  'prestacao-contas',
  prestacaoContasMock
)
