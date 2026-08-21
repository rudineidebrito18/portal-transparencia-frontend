import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const competenciasService = criarServicoDocumentoGenerico<'competencias'>(
  'institucional'
)
