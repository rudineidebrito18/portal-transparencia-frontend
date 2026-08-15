import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { ConselhoMunicipal } from './types'

const BASE = '/conselhos'

export const conselhoSaudeService = {
  // Sem constraint de unicidade por tipo no backend — pode existir histórico de mandatos.
  // Lista pequena por natureza (não há UI de paginação), mesmo padrão de secretarias.service.
  listar(): Promise<ConselhoMunicipal[]> {
    return api
      .get<Page<ConselhoMunicipal>>(BASE, { params: { tipo: 'SAUDE', sort: 'mandatoInicio,desc', size: 50 } })
      .then(r => r.data.content)
  }
}
