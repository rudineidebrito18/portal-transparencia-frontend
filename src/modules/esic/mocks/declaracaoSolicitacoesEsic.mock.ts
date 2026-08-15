import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'declaracao-solicitacoes': ['Declaração de solicitações no e-SIC — últimos 12 meses']
}

export const declaracaoSolicitacoesEsicMock = criarMockDocumentoGenerico<'declaracao-solicitacoes'>(
  DESCRICOES,
  'esic'
)
