import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { cargoMock } from './mocks/cargo.mock'
import { Cargo, FiltroCargo } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroCargo & {
  page?: number
  size?: number
  sort?: string
}

export const cargoService = {
  listar(params: ListarParams): Promise<Page<Cargo>> {
    if (USE_MOCK) return cargoMock.listar(params)

    return api.get<Page<Cargo>>('/recursos-humanos/cargos/filtro', { params }).then(r => r.data)
  }
}
