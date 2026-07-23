import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { obraMock } from './mocks/obra.mock'
import { FiltroObraPublica, ObraPublica } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroObraPublica & { page?: number; size?: number; sort?: string }

export const obraService = {
  listar(params: ListarParams): Promise<Page<ObraPublica>> {
    if (USE_MOCK) return obraMock.listar(params)

    return api.get<Page<ObraPublica>>('/obras/filtro', { params }).then(r => r.data)
  }
}
