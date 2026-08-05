import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { competenciasMock } from './mocks/competencias.mock'

export const competenciasService = criarServicoDocumentoGenerico<'competencias'>(
  'institucional',
  competenciasMock
)
