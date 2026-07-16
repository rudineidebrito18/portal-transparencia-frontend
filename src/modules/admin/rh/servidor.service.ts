import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { FiltroServidor, Servidor, ServidorRequest } from './types'

const BASE = '/recursos-humanos/servidor'

type ListarParams = FiltroServidor & { page?: number; size?: number; sort?: string }

export const servidorService = {
  listar(params: ListarParams): Promise<Page<Servidor>> {
    return api.get<Page<Servidor>>(`${BASE}/buscar`, { params }).then(r => r.data)
  },

  criar(dados: ServidorRequest): Promise<Servidor> {
    return api.post<Servidor>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: ServidorRequest): Promise<Servidor> {
    return api.put<Servidor>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
