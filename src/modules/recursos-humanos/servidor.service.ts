import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { FiltroServidor, Servidor } from './types'

type ListarParams = FiltroServidor & {
  page?: number
  size?: number
  sort?: string
}

export const servidorService = {
  listar(params: ListarParams): Promise<Page<Servidor>> {
    return api
      .get<Page<Servidor>>('/recursos-humanos/servidor/buscar', { params })
      .then(response => response.data)
  },

  buscarPorId(id: number): Promise<Servidor> {
    return api
      .get<Servidor>(`/recursos-humanos/servidor/${id}`)
      .then(response => response.data)
  }
}
