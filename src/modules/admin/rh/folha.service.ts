import { api } from '@/services/api'
import { FolhaPagamento, FolhaPagamentoRequest, FolhaPagamentoServidor } from './types'

const BASE = '/recursos-humanos/folha'

// Sem PUT/DELETE aqui — o backend só permite criar (POST) e consultar.
export const folhaService = {
  listarPorServidor(servidorId: number): Promise<FolhaPagamento[]> {
    return api.get<FolhaPagamento[]>(`${BASE}/servidor/${servidorId}`).then(r => r.data)
  },

  criar(servidorId: number, dados: FolhaPagamentoRequest): Promise<FolhaPagamento> {
    return api.post<FolhaPagamento>(`${BASE}/servidor/${servidorId}`, dados).then(r => r.data)
  },

  listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    return api.get<FolhaPagamentoServidor[]>(`${BASE}/por-mes`, { params: { mes, ano } }).then(r => r.data)
  }
}
