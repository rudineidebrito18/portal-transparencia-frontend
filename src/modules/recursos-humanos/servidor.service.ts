import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { servidorMock } from './mocks/servidor.mock'
import { FiltroServidor, Servidor } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroServidor & {
  page?: number
  size?: number
  sort?: string
}

export const servidorService = {
  listar(params: ListarParams): Promise<Page<Servidor>> {
    if (USE_MOCK) return servidorMock.listar(params)

    return api
      .get<Page<Servidor>>('/recursos-humanos/servidor/buscar', { params })
      .then(response => response.data)
  },

  buscarPorId(id: number): Promise<Servidor> {
    if (USE_MOCK) return servidorMock.buscarPorId(id)

    return api
      .get<Servidor>(`/recursos-humanos/servidor/${id}`)
      .then(response => response.data)
  }
}
