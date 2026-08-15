import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { declaracaoSigiloEsicService } from '../declaracaoSigilo.service'

const useDocumentos = criarUseDocumentosGenerico<'declaracao-sigilo'>(declaracaoSigiloEsicService)

export function useDeclaracaoSigiloEsic() {
  return useDocumentos('declaracao-sigilo')
}
