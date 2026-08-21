import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const renunciaFiscalService = criarServicoDocumentoGenerico<'renuncia-fiscal'>(
  'gestao-fiscal'
)
