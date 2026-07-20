import { api } from '@/services/api'
import { Aditivo } from '@/modules/contratos/types'
import { AditivoRequest } from './types'

const BASE = '/licitacoes/contratos/aditivos'

export const aditivoService = {
  criar(dados: AditivoRequest): Promise<Aditivo> {
    return api.post<Aditivo>(BASE, dados).then(r => r.data)
  },

  listarPorContrato(contratoLicitacaoId: number): Promise<Aditivo[]> {
    return api.get<Aditivo[]>(BASE, { params: { contratoLicitacaoId } }).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
