import { api } from '@/services/api'
import { Medicao, MedicaoRequest } from './types'

const base = (obraId: number) => `/obras/${obraId}/medicoes`

export const medicaoService = {
  listarPorObra(obraId: number): Promise<Medicao[]> {
    return api.get<Medicao[]>(base(obraId)).then(r => r.data)
  },

  criar(obraId: number, dados: MedicaoRequest): Promise<Medicao> {
    return api.post<Medicao>(base(obraId), dados).then(r => r.data)
  },

  atualizar(obraId: number, id: number, dados: MedicaoRequest): Promise<Medicao> {
    return api.put<Medicao>(`${base(obraId)}/${id}`, dados).then(r => r.data)
  },

  excluir(obraId: number, id: number): Promise<void> {
    return api.delete(`${base(obraId)}/${id}`).then(() => undefined)
  }
}
