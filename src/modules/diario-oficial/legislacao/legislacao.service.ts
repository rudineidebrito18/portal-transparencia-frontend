import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { legislacaoDiarioOficialMock } from './mocks/legislacao.mock'

// Leis relacionadas ao próprio Diário Oficial (ex: lei que instituiu o sistema) — recurso
// distinto de src/modules/legislacao (legislação municipal em geral). Endpoint novo, ainda
// não existe no backend (ver prompt-backend-diario-oficial.md).
export const legislacaoDiarioOficialService = criarServicoDocumentoGenerico<'legislacao'>(
  'diario-oficial',
  legislacaoDiarioOficialMock
)
