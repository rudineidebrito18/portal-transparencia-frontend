import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EmendaParlamentar, EmendaParlamentarRequest, FiltroEmendaParlamentar } from './types'

const BASE = '/emendas-parlamentares'

type ListarParams = FiltroEmendaParlamentar & { page?: number; size?: number; sort?: string }

export const emendaParlamentarService = {
  // Mesma lógica de roteamento do serviço público: tipo e ano são endpoints
  // separados, sem filtro combinado — tipo tem prioridade se os dois vierem setados.
  listar(params: ListarParams): Promise<Page<EmendaParlamentar>> {
    const { tipo, ano, ...pageable } = params

    if (tipo) {
      return api.get<Page<EmendaParlamentar>>(`${BASE}/tipo/${tipo}`, { params: pageable }).then(r => r.data)
    }

    if (ano !== undefined) {
      return api.get<Page<EmendaParlamentar>>(`${BASE}/ano/${ano}`, { params: pageable }).then(r => r.data)
    }

    return api.get<Page<EmendaParlamentar>>(BASE, { params: pageable }).then(r => r.data)
  },

  criar(dados: EmendaParlamentarRequest): Promise<EmendaParlamentar> {
    return api.post<EmendaParlamentar>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: EmendaParlamentarRequest): Promise<EmendaParlamentar> {
    return api.put<EmendaParlamentar>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
