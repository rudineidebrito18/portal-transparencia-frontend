import { useDocumentosRH } from './useDocumentosRH'

export function useEstagiarios() {
  return useDocumentosRH('estagiarios')
}
