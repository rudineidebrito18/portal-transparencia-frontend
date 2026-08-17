import { api, type ApiError } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EmendaEstadual, EmendaEstadualDescoberta, EmendaEstadualRequest, FiltroEmendaEstadual } from './types'

const BASE = '/emendas-estaduais'

type ListarParams = FiltroEmendaEstadual & { page?: number; size?: number; sort?: string }

export const emendaEstadualService = {
  listar(params: ListarParams): Promise<Page<EmendaEstadual>> {
    const { ano, ...pageable } = params

    if (ano !== undefined) {
      return api.get<Page<EmendaEstadual>>(`${BASE}/ano/${ano}`, { params: pageable }).then(r => r.data)
    }

    return api.get<Page<EmendaEstadual>>(BASE, { params: pageable }).then(r => r.data)
  },

  criar(dados: EmendaEstadualRequest): Promise<EmendaEstadual> {
    return api.post<EmendaEstadual>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: EmendaEstadualRequest): Promise<EmendaEstadual> {
    return api.put<EmendaEstadual>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },

  // Busca assistida (o ano é extraído do próprio código EPI.<ano>.<sequencial>, não precisa ser
  // informado à parte). null quando não encontra — o admin cai pro formulário em branco.
  async buscarAssistido(codigo: string): Promise<EmendaEstadualRequest | null> {
    try {
      const response = await api.post<EmendaEstadualRequest>(`${BASE}/buscar`, null, { params: { codigo } })
      return response.data
    } catch (e: unknown) {
      if ((e as ApiError)?.status === 404) return null
      throw e
    }
  },

  // Busca por município (Localizador de Gasto): traz todas as emendas estaduais do ano corrente,
  // sem exigir código conhecido — complementar à busca por código.
  descobrirDoMunicipio(): Promise<EmendaEstadualDescoberta[]> {
    return api.post<EmendaEstadualDescoberta[]>(`${BASE}/descobrir`).then(r => r.data)
  },

  importarDoMunicipio(codigosEmenda: string[]): Promise<EmendaEstadual[]> {
    return api.post<EmendaEstadual[]>(`${BASE}/importar`, codigosEmenda).then(r => r.data)
  }
}
