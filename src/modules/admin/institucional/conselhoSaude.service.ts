import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  ConselhoMunicipal,
  ConselhoMunicipalRequest,
  MembroConselho,
  MembroConselhoRequest,
  TipoConselho
} from '@/modules/conselho-saude/types'

const BASE = '/conselhos'

export const conselhoSaudeService = {
  // Sem UI de paginação — lista pequena por natureza, mesmo padrão do service público.
  listar(): Promise<ConselhoMunicipal[]> {
    return api
      .get<Page<ConselhoMunicipal>>(BASE, { params: { tipo: TipoConselho.SAUDE, sort: 'mandatoInicio,desc', size: 50 } })
      .then(r => r.data.content)
  },

  buscarPorId(id: number): Promise<ConselhoMunicipal> {
    return api.get<ConselhoMunicipal>(`${BASE}/${id}`).then(r => r.data)
  },

  criar(dados: ConselhoMunicipalRequest): Promise<ConselhoMunicipal> {
    return api.post<ConselhoMunicipal>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: ConselhoMunicipalRequest): Promise<ConselhoMunicipal> {
    return api.put<ConselhoMunicipal>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`)
  }
}

export const membroConselhoService = {
  criar(conselhoId: number, dados: MembroConselhoRequest): Promise<MembroConselho> {
    return api.post<MembroConselho>(`${BASE}/${conselhoId}/membros`, dados).then(r => r.data)
  },

  atualizar(conselhoId: number, id: number, dados: MembroConselhoRequest): Promise<MembroConselho> {
    return api.put<MembroConselho>(`${BASE}/${conselhoId}/membros/${id}`, dados).then(r => r.data)
  },

  excluir(conselhoId: number, id: number): Promise<void> {
    return api.delete(`${BASE}/${conselhoId}/membros/${id}`)
  }
}
