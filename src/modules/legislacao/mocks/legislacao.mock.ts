import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  lei: [
    'Lei Orgânica Municipal',
    'Lei Municipal - Atos Normativos',
    'Decreto Municipal - Regulamentação',
    'Portaria - Ato Normativo Interno'
  ]
}

export const legislacaoMock = criarMockDocumentoGenerico<'lei'>(
  DESCRICOES,
  'legislacao'
)
