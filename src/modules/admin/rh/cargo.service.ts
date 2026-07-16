import { api } from '@/services/api'
import { Cargo, CargoRequest } from './types'

const BASE = '/recursos-humanos/cargos'

export const cargoService = {
  listar(): Promise<Cargo[]> {
    return api.get<Cargo[]>(BASE).then(r => r.data)
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
