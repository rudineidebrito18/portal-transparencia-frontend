import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  'emenda-municipal': [
    'Emenda Municipal nº 001 - Pavimentação Asfáltica',
    'Emenda Municipal nº 002 - Reforma de Unidade de Saúde',
    'Emenda Municipal nº 003 - Aquisição de Equipamentos Escolares',
    'Emenda Municipal nº 004 - Iluminação Pública'
  ]
}

export const emendasMunicipaisMock = criarMockDocumentoGenerico<'emenda-municipal'>(
  DESCRICOES,
  'convenios'
)
