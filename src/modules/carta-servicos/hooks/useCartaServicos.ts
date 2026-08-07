import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { cartaServicosService } from '../carta-servicos.service'

const useDocumentosCartaServicos = criarUseDocumentosGenerico<'carta-servicos'>(cartaServicosService)

export function useCartaServicos() {
  return useDocumentosCartaServicos('carta-servicos')
}
