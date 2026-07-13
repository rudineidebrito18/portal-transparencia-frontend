import { api } from '@/services/api'
import { folhaMock } from './mocks/folha.mock'
import { FolhaPagamento, FolhaPagamentoServidor } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const folhaService = {
  listarPorServidor(servidorId: number): Promise<FolhaPagamento[]> {
    if (USE_MOCK) return folhaMock.listarPorServidor(servidorId)

    return api
      .get<FolhaPagamento[]>(`/recursos-humanos/folha/servidor/${servidorId}`)
      .then(response => response.data)
  },

  listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    if (USE_MOCK) return folhaMock.listarPorMes(mes, ano)

    return api
      .get<FolhaPagamentoServidor[]>('/recursos-humanos/folha/por-mes', { params: { mes, ano } })
      .then(response => response.data)
  }
}
