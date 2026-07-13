import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { prestacaoContasService } from '../prestacaoContas.service'
import { RecursoPrestacaoContas } from '../types'

export const useDocumentosPrestacaoContas = criarUseDocumentosGenerico<RecursoPrestacaoContas>(
  prestacaoContasService
)
