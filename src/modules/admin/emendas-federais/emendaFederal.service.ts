import { api, type ApiError } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EmendaFederal, EmendaFederalDescoberta, EmendaFederalRequest, FiltroEmendaFederal } from './types'

const BASE = '/emendas-federais'

type ListarParams = FiltroEmendaFederal & { page?: number; size?: number; sort?: string }

export const emendaFederalService = {
  // Mesma lógica de roteamento do serviço público: tipo e ano são endpoints
  // separados, sem filtro combinado — tipo tem prioridade se os dois vierem setados.
  listar(params: ListarParams): Promise<Page<EmendaFederal>> {
    const { tipo, ano, ...pageable } = params

    if (tipo) {
      return api.get<Page<EmendaFederal>>(`${BASE}/tipo/${tipo}`, { params: pageable }).then(r => r.data)
    }

    if (ano !== undefined) {
      return api.get<Page<EmendaFederal>>(`${BASE}/ano/${ano}`, { params: pageable }).then(r => r.data)
    }

    return api.get<Page<EmendaFederal>>(BASE, { params: pageable }).then(r => r.data)
  },

  criar(dados: EmendaFederalRequest): Promise<EmendaFederal> {
    return api.post<EmendaFederal>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: EmendaFederalRequest): Promise<EmendaFederal> {
    return api.put<EmendaFederal>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },

  // Busca assistida (PLANO_MODULO_EMENDAS.md §5.3): não salva nada, só devolve um preview pra
  // pré-preencher o formulário. null quando nenhuma fonte oficial encontra o código — o admin
  // cai pro formulário em branco.
  async buscarAssistido(codigo: string): Promise<EmendaFederalRequest | null> {
    try {
      const response = await api.post<EmendaFederalRequest>(`${BASE}/buscar`, null, { params: { codigo } })
      return response.data
    } catch (e: unknown) {
      if ((e as ApiError)?.status === 404) return null
      throw e
    }
  },

  // Busca por CNPJ: traz todas as emendas do município de uma vez, sem exigir código conhecido
  // (complementar à busca por código — não substitui, cobre o caso de achar emenda nova).
  descobrirDoMunicipio(): Promise<EmendaFederalDescoberta[]> {
    return api.post<EmendaFederalDescoberta[]>(`${BASE}/descobrir`).then(r => r.data)
  },

  importarDoMunicipio(codigosEmenda: string[]): Promise<EmendaFederal[]> {
    return api.post<EmendaFederal[]>(`${BASE}/importar`, codigosEmenda).then(r => r.data)
  }
}
