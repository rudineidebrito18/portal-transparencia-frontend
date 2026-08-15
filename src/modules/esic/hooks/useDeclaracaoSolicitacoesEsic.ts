import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { declaracaoSolicitacoesEsicService } from '../declaracaoSolicitacoes.service'

const useDocumentos = criarUseDocumentosGenerico<'declaracao-solicitacoes'>(declaracaoSolicitacoesEsicService)

export function useDeclaracaoSolicitacoesEsic() {
  return useDocumentos('declaracao-solicitacoes')
}
