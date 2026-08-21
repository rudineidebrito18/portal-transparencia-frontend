import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { FiltroObraPublica, ObraPublica } from './types'

type ListarParams = FiltroObraPublica & { page?: number; size?: number; sort?: string }

export const obraService = {
  listar(params: ListarParams): Promise<Page<ObraPublica>> {
    return api.get<Page<ObraPublica>>('/obras/filtro', { params }).then(r => r.data)
  }
}
