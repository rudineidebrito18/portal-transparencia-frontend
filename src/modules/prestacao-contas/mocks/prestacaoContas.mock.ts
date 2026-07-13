import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'
import { RecursoPrestacaoContas } from '../types'

const DESCRICOES: Record<RecursoPrestacaoContas, string[]> = {
  'balanco-geral': ['Balanço Geral do Exercício', 'Balanço Orçamentário', 'Balanço Financeiro', 'Balanço Patrimonial'],
  'parecer-previo': ['Parecer Prévio do TCE sobre as Contas do Exercício', 'Parecer Prévio - Contas Anuais'],
  'julgamento-contas-tce': ['Acórdão de Julgamento das Contas - TCE', 'Decisão do Tribunal de Contas'],
  'julgamento-contas-legislativo': ['Decreto Legislativo de Julgamento das Contas', 'Parecer da Câmara Municipal'],
  'prestacao-contas-anos-anteriores': ['Prestação de Contas', 'Relatório de Gestão Fiscal']
}

export const prestacaoContasMock = criarMockDocumentoGenerico<RecursoPrestacaoContas>(
  DESCRICOES,
  'prestacao-contas'
)
