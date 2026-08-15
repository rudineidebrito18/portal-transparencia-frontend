import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  regulamentacao: [
    'Decreto que regulamenta o SIC municipal',
    'Portaria de nomeação da autoridade de monitoramento da LAI'
  ]
}

export const regulamentacaoEsicMock = criarMockDocumentoGenerico<'regulamentacao'>(
  DESCRICOES,
  'esic'
)
