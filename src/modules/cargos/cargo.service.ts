import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { Cargo, FiltroCargo } from './types'

type ListarParams = FiltroCargo & {
  page?: number
  size?: number
  sort?: string
}

export const cargoService = {
  listar(params: ListarParams): Promise<Page<Cargo>> {
    return api.get<Page<Cargo>>('/recursos-humanos/cargos/filtro', { params }).then(r => r.data)
  }
}
