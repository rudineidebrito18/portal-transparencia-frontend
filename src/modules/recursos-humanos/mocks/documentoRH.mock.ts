import { criarMockDocumentoGenerico } from '@/modules/shared/mocks/documentoGenericoMock'
import { RecursoDocumentoRH } from '../types'

const DESCRICOES: Record<RecursoDocumentoRH, string[]> = {
  estagiarios: ['Estagiário de TI', 'Estagiário Administrativo', 'Termo de Compromisso de Estágio'],
  terceirizados: ['Contrato de Limpeza', 'Contrato de Vigilância', 'Contrato de Apoio Administrativo']
}

export const documentoRHMock = criarMockDocumentoGenerico<RecursoDocumentoRH>(
  DESCRICOES,
  'recursos-humanos'
)
