import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { legislacaoService } from '../legislacao.service'

const useDocumentosLegislacao = criarUseDocumentosGenerico<'lei'>(legislacaoService)

export function useLegislacao() {
  return useDocumentosLegislacao('lei')
}
