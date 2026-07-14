import { api } from '@/services/api'
import { cargoMock } from './mocks/cargo.mock'
import { Cargo } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const cargoService = {
  listar(): Promise<Cargo[]> {
    if (USE_MOCK) return cargoMock.listar()

    return api.get<Cargo[]>('/recursos-humanos/cargos').then(r => r.data)
  }
}
