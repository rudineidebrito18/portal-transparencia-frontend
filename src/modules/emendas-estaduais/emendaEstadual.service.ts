import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { EmendaEstadual, FiltroEmendaEstadual } from './types'

type ListarParams = FiltroEmendaEstadual & {
  page?: number
  size?: number
  sort?: string
}

export const emendaEstadualService = {
  listar(params: ListarParams): Promise<Page<EmendaEstadual>> {
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
