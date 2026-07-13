import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { renunciaFiscalService } from '../renunciaFiscal.service'

const useDocumentosRenunciaFiscal = criarUseDocumentosGenerico<'renuncia-fiscal'>(renunciaFiscalService)

export function useRenunciaFiscal() {
  return useDocumentosRenunciaFiscal('renuncia-fiscal')
}
