import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { planejamentoService } from '../planejamento.service'
import { RecursoPlanejamento } from '../types'

export const useDocumentosPlanejamento = criarUseDocumentosGenerico<RecursoPlanejamento>(
  planejamentoService
)
