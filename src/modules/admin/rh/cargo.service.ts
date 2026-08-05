import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { Cargo, CargoRequest, FiltroCargo } from './types'

const BASE = '/recursos-humanos/cargos'

type ListarParams = FiltroCargo & {
  page?: number
  size?: number
  sort?: string
}

export const cargoService = {
  listar(params: ListarParams): Promise<Page<Cargo>> {
    return api.get<Page<Cargo>>(`${BASE}/filtro`, { params }).then(r => r.data)
  },

  criar(dados: CargoRequest): Promise<Cargo> {
    return api.post<Cargo>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: CargoRequest): Promise<Cargo> {
    return api.put<Cargo>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
