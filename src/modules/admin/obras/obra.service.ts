import { api } from '@/services/api'
import { ObraPublica, ObraRequest } from './types'

const BASE = '/obras'

export const obraService = {
  listar(): Promise<ObraPublica[]> {
    return api.get<ObraPublica[]>(BASE).then(r => r.data)
  },

  buscarPorId(id: number): Promise<ObraPublica> {
    return api.get<ObraPublica>(`${BASE}/${id}`).then(r => r.data)
  },

  criar(dados: ObraRequest): Promise<ObraPublica> {
    return api.post<ObraPublica>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: ObraRequest): Promise<ObraPublica> {
    return api.put<ObraPublica>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
