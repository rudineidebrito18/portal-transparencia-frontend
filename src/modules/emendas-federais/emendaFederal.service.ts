import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { emendaFederalMock } from './mocks/emendaFederal.mock'
import { EmendaFederal, FiltroEmendaFederal } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroEmendaFederal & {
  page?: number
  size?: number
  sort?: string
}

export const emendaFederalService = {
  listar(params: ListarParams): Promise<Page<EmendaFederal>> {
    if (USE_MOCK) return emendaFederalMock.listar(params)

    const { tipo, ano, ...pageable } = params

    // Backend não tem filtro combinado — /tipo/{tipo} e /ano/{ano} são endpoints
    // separados do listar geral, por isso o tipo tem prioridade se os dois vierem setados.
    if (tipo) {
      return api
        .get<Page<EmendaFederal>>(`/emendas-federais/tipo/${tipo}`, { params: pageable })
        .then(response => response.data)
    }

    if (ano !== undefined) {
      return api
        .get<Page<EmendaFederal>>(`/emendas-federais/ano/${ano}`, { params: pageable })
        .then(response => response.data)
    }

    return api
      .get<Page<EmendaFederal>>('/emendas-federais', { params: pageable })
      .then(response => response.data)
  }
}
