import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { FiltroFolhaPagamento, FolhaPagamento, FolhaPagamentoServidor } from './types'

type ListarPorMesParams = FiltroFolhaPagamento & {
  page?: number
  size?: number
  sort?: string
}

export const folhaService = {
  listarPorServidor(servidorId: number): Promise<FolhaPagamento[]> {
    return api
      .get<FolhaPagamento[]>(`/recursos-humanos/folha/servidor/${servidorId}`)
      .then(response => response.data)
  },

  // mes/ano são obrigatórios no backend — se ausentes da URL (filtro ainda não aplicado
  // pelo usuário), assume o mês/ano atual aqui, não no hook genérico usePageableResource.
  listarPorMes(params: ListarPorMesParams): Promise<Page<FolhaPagamentoServidor>> {
    const hoje = new Date()
    const mes = params.mes ?? hoje.getMonth() + 1
    const ano = params.ano ?? hoje.getFullYear()

    return api
      .get<Page<FolhaPagamentoServidor>>('/recursos-humanos/folha/por-mes', { params: { ...params, mes, ano } })
      .then(response => response.data)
  }
}
