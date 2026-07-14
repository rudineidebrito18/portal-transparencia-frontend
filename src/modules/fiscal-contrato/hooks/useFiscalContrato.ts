import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { fiscalContratoService } from '../fiscalContrato.service'

const useDocumentosFiscalContrato = criarUseDocumentosGenerico<'fiscal-contratos'>(fiscalContratoService)

export function useFiscalContrato() {
  return useDocumentosFiscalContrato('fiscal-contratos')
}
