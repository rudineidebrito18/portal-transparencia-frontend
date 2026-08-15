import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { ConselhoMunicipal, TipoConselho } from './types'

const BASE = '/conselhos'

export const conselhoMunicipalService = {
  // Sem UI de paginação — lista pequena por natureza (não há constraint de unicidade
  // por tipo no backend, mas na prática é só o histórico de mandatos de 1 conselho).
  listar(tipo: TipoConselho): Promise<ConselhoMunicipal[]> {
    return api
      .get<Page<ConselhoMunicipal>>(BASE, { params: { tipo, sort: 'mandatoInicio,desc', size: 50 } })
      .then(r => r.data.content)
  }
}
