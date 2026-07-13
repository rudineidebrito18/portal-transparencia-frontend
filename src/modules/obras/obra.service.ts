import { api } from '@/services/api'
import { obraMock } from './mocks/obra.mock'
import { ObraPublica } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const obraService = {
  listar(): Promise<ObraPublica[]> {
    if (USE_MOCK) return obraMock.listar()

    return api.get<ObraPublica[]>('/obras').then(r => r.data)
  }
}
