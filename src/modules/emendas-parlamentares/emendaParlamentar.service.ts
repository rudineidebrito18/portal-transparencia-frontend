import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { emendaParlamentarMock } from './mocks/emendaParlamentar.mock'
import { EmendaParlamentar, FiltroEmendaParlamentar } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroEmendaParlamentar & {
  page?: number
  size?: number
  sort?: string
}

export const emendaParlamentarService = {
  listar(params: ListarParams): Promise<Page<EmendaParlamentar>> {
    if (USE_MOCK) return emendaParlamentarMock.listar(params)

    const { tipo, ano, ...pageable } = params

    // Backend não tem filtro combinado — /tipo/{tipo} e /ano/{ano} são endpoints
    // separados do listar geral, por isso o tipo tem prioridade se os dois vierem setados.
    if (tipo) {
      return api
        .get<Page<EmendaParlamentar>>(`/emendas-parlamentares/tipo/${tipo}`, { params: pageable })
        .then(response => response.data)
    }

    if (ano !== undefined) {
      return api
        .get<Page<EmendaParlamentar>>(`/emendas-parlamentares/ano/${ano}`, { params: pageable })
        .then(response => response.data)
    }

    return api
      .get<Page<EmendaParlamentar>>('/emendas-parlamentares', { params: pageable })
      .then(response => response.data)
  }
}
