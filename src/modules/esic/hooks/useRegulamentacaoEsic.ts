import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { regulamentacaoEsicService } from '../regulamentacao.service'

const useDocumentos = criarUseDocumentosGenerico<'regulamentacao'>(regulamentacaoEsicService)

export function useRegulamentacaoEsic() {
  return useDocumentos('regulamentacao')
}
