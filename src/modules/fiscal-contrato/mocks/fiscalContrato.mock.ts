import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'fiscal-contratos': [
    'Portaria de Designação do Fiscal de Contrato',
    'Termo de Fiscalização Contratual',
    'Relatório de Acompanhamento de Execução Contratual',
    'Ato de Substituição de Fiscal de Contrato'
  ]
}

export const fiscalContratoMock = criarMockDocumentoGenerico<'fiscal-contratos'>(
  DESCRICOES,
  'licitacao'
)
