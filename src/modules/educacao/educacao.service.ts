import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'
import { RecursoEducacao } from './types'

export const educacaoService = criarServicoDocumentoGenerico<RecursoEducacao>(
  'educacao'
)
