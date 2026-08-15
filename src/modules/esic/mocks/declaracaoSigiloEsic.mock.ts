import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'declaracao-sigilo': ['Declaração de inexistência de informações classificadas com sigilo — últimos 12 meses']
}

export const declaracaoSigiloEsicMock = criarMockDocumentoGenerico<'declaracao-sigilo'>(
  DESCRICOES,
  'esic'
)
