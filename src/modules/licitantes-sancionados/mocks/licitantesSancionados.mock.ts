import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'licitantes-sancionados': [
    'Declaração de Inexistência de Licitantes ou Contratados/Fornecedores Sancionados',
    'Licitantes Sancionados'
  ]
}

export const licitantesSancionadosMock = criarMockDocumentoGenerico<'licitantes-sancionados'>(DESCRICOES, 'licitacoes/licitantes-sancionados')
