import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const cartaServicosService = criarServicoDocumentoGenerico<'carta-servicos'>(
  'institucional'
)
