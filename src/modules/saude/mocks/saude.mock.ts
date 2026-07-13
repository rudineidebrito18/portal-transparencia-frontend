import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'
import { RecursoSaude } from '../types'

const DESCRICOES: Record<RecursoSaude, string[]> = {
  planos: ['Plano Municipal de Saúde', 'Programação Anual de Saúde', 'Relatório de Gestão da Saúde'],
  relatorios: ['Relatório Detalhado do Quadrimestre Anterior', 'Relatório de Monitoramento das Metas de Saúde'],
  medicamentos: ['Lista de Medicamentos de Alto Custo (SUS)', 'Protocolo de Dispensação de Medicamentos Excepcionais'],
  unidade: ['Cadastro de Unidades de Saúde', 'Relação de Unidades Básicas de Saúde']
}

export const saudeMock = criarMockDocumentoGenerico<RecursoSaude>(
  DESCRICOES,
  'saude'
)
