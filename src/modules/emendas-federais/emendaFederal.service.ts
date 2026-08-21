import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { EmendaFederal, FiltroEmendaFederal } from './types'

type ListarParams = FiltroEmendaFederal & {
  page?: number
  size?: number
  sort?: string
}

export const emendaFederalService = {
  listar(params: ListarParams): Promise<Page<EmendaFederal>> {
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
