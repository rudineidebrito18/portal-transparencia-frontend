import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'

const DESCRICOES = {
  competencias: [
    'Competências do Gabinete do Prefeito',
    'Competências da Secretaria Municipal de Administração, Planejamento e Finanças',
    'Competências da Secretaria Municipal de Educação, Cultura e Turismo',
    'Competências da Secretaria Municipal de Saúde',
    'Competências da Secretaria Municipal de Assistência Social',
    'Competências da Secretaria Municipal de Agricultura, Abastecimento e Meio Ambiente',
    'Competências da Secretaria Municipal de Transporte, Obras e Urbanismo',
    'Competências da Secretaria Municipal de Juventude, Esporte e Lazer'
  ]
}

export const competenciasMock = criarMockDocumentoGenerico<'competencias'>(
  DESCRICOES,
  'competencias'
)
