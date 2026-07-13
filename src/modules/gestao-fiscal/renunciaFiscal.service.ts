import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { renunciaFiscalMock } from './mocks/renunciaFiscal.mock'

export const renunciaFiscalService = criarServicoDocumentoGenerico<'renuncia-fiscal'>(
  'gestao-fiscal',
  renunciaFiscalMock
)
