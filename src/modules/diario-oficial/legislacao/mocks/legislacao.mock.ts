import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  legislacao: ['Lei de Criação do Diário Oficial Eletrônico', 'Decreto Regulamentador do Diário Oficial', 'Portaria de Normas de Publicação']
}

export const legislacaoDiarioOficialMock = criarMockDocumentoGenerico<'legislacao'>(DESCRICOES, 'diario-oficial/legislacao')
