import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { emendaEstadualMock } from './mocks/emendaEstadual.mock'
import { EmendaEstadual, FiltroEmendaEstadual } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroEmendaEstadual & {
  page?: number
  size?: number
  sort?: string
}

export const emendaEstadualService = {
  listar(params: ListarParams): Promise<Page<EmendaEstadual>> {
    if (USE_MOCK) return emendaEstadualMock.listar(params)

    const { ano, ...pageable } = params

    if (ano !== undefined) {
      return api
        .get<Page<EmendaEstadual>>(`/emendas-estaduais/ano/${ano}`, { params: pageable })
        .then(response => response.data)
    }

    return api
      .get<Page<EmendaEstadual>>('/emendas-estaduais', { params: pageable })
      .then(response => response.data)
  }
}
