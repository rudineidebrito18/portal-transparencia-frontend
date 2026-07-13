import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { educacaoService } from '../educacao.service'
import { RecursoEducacao } from '../types'

export const useDocumentosEducacao = criarUseDocumentosGenerico<RecursoEducacao>(
  educacaoService
)
