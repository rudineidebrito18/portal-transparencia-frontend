import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
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

  // Backend agora pagina esse GET — pedimos uma página grande porque a tela
  // não pagina a folha do mês, só lista tudo de uma vez.
  listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    return api
      .get<Page<FolhaPagamentoServidor>>(`${BASE}/por-mes`, { params: { mes, ano, size: 1000 } })
      .then(r => r.data.content)
  }
}
