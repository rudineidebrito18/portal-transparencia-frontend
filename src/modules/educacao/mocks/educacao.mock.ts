import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'
import { RecursoEducacao } from '../types'

const DESCRICOES: Record<RecursoEducacao, string[]> = {
  'lista-alunos': ['Lista de Alunos Matriculados', 'Lista de Alunos - Rede Municipal', 'Lista de Alunos por Escola'],
  'lista-espera-creche': ['Lista de Espera para Creche', 'Lista de Espera - Educação Infantil'],
  'lista-solicitacao-matricula': ['Lista de Solicitações de Matrícula', 'Solicitações de Matrícula - Rede Municipal'],
  planos: ['Plano Municipal de Educação', 'Plano Municipal de Educação - Revisão']
}

export const educacaoMock = criarMockDocumentoGenerico<RecursoEducacao>(
  DESCRICOES,
  'educacao'
)
