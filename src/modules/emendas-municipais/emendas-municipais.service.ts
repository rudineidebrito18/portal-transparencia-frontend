import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { emendasMunicipaisMock } from './mocks/emendas-municipais.mock'

export const emendasMunicipaisService = criarServicoDocumentoGenerico<'emenda-municipal'>(
  'convenios',
  emendasMunicipaisMock
)
