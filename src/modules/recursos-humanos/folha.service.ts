import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
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

  // Backend agora pagina esse GET — pedimos uma página grande porque o hook consumidor
  // (useFolhaPorMes) soma o total da folha do mês inteiro e pagina em memória.
  listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    if (USE_MOCK) return folhaMock.listarPorMes(mes, ano)

    return api
      .get<Page<FolhaPagamentoServidor>>('/recursos-humanos/folha/por-mes', { params: { mes, ano, size: 1000 } })
      .then(response => response.data.content)
  }
}
