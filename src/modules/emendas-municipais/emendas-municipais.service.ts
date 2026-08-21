import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const emendasMunicipaisService = criarServicoDocumentoGenerico<'emenda-municipal'>(
  'convenios'
)
