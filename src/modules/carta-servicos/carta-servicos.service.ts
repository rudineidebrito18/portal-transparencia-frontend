import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { cartaServicosMock } from './mocks/carta-servicos.mock'

export const cartaServicosService = criarServicoDocumentoGenerico<'carta-servicos'>(
  'institucional',
  cartaServicosMock
)
