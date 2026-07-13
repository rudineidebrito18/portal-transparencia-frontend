import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { diariaMock } from './mocks/diaria.mock'
import { Diaria, FiltroDiaria } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroDiaria & {
  page?: number
  size?: number
  sort?: string
}

export const diariaService = {
  listar(params: ListarParams): Promise<Page<Diaria>> {
    if (USE_MOCK) return diariaMock.listar(params)

    return api
      .get<Page<Diaria>>('/diarias/buscar', { params })
      .then(response => response.data)
  }
}
