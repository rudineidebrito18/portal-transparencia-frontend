import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'licitantes-contratados': [
    'Relação de Licitantes Contratados'
  ]
}

export const licitanteContratadoMock = criarMockDocumentoGenerico<'licitantes-contratados'>(DESCRICOES, 'licitacoes/licitantes-contratados')
