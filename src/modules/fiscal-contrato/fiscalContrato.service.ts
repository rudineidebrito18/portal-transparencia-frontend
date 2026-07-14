import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { fiscalContratoMock } from './mocks/fiscalContrato.mock'

export const fiscalContratoService = criarServicoDocumentoGenerico<'fiscal-contratos'>(
  'licitacao',
  fiscalContratoMock
)
