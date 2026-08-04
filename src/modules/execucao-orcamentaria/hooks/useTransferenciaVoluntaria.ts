import { criarUseDocumentosGenerico } from '@/modules/shared/hooks/useDocumentosGenerico'
import { execucaoOrcamentariaService } from '../execucaoOrcamentaria.service'

const useDocumentosExecucaoOrcamentaria = criarUseDocumentosGenerico<'transferencia-voluntaria'>(
  execucaoOrcamentariaService
)

export function useTransferenciaVoluntaria() {
  return useDocumentosExecucaoOrcamentaria('transferencia-voluntaria')
}
