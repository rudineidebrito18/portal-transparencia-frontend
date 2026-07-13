import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'renuncia-fiscal': [
    'Declaração de Renúncias Fiscais',
    'Renúncia Fiscal - Isenção de IPTU',
    'Renúncia Fiscal - Incentivos Fiscais'
  ]
}

export const renunciaFiscalMock = criarMockDocumentoGenerico<'renuncia-fiscal'>(
  DESCRICOES,
  'gestao-fiscal'
)
