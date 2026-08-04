import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'transferencia-voluntaria': [
    'Transferência Voluntária — Convênio Federal',
    'Transferência Voluntária — Convênio Estadual',
    'Transferência Disciplinada pela EC nº 105/2019'
  ]
}

export const execucaoOrcamentariaMock = criarMockDocumentoGenerico<'transferencia-voluntaria'>(
  DESCRICOES,
  'execucao-orcamentaria'
)
