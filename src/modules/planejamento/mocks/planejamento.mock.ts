import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'
import { RecursoPlanejamento } from '../types'

const DESCRICOES: Record<RecursoPlanejamento, string[]> = {
  ldo: ['Lei de Diretrizes Orçamentárias', 'LDO - Anexo de Metas Fiscais', 'LDO - Anexo de Riscos Fiscais'],
  loa: ['Lei Orçamentária Anual', 'LOA - Quadro de Detalhamento da Despesa', 'LOA - Anexo de Receitas e Despesas'],
  ppa: ['Plano Plurianual', 'PPA - Programas e Ações', 'PPA - Revisão Anual'],
  'plano-estrategico': ['Plano Estratégico Institucional', 'Plano Estratégico - Revisão Anual'],
  rga: ['Relatório de Gestão e Atividades', 'Relatório Anual de Atividades']
}

export const planejamentoMock = criarMockDocumentoGenerico<RecursoPlanejamento>(
  DESCRICOES,
  'planejamento'
)
