import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { Diaria, DiariaRequest, FiltroDiaria } from './types'

const BASE = '/diarias'

type ListarParams = FiltroDiaria & { page?: number; size?: number; sort?: string }

export const diariaService = {
  listar(params: ListarParams): Promise<Page<Diaria>> {
    return api.get<Page<Diaria>>(`${BASE}/buscar`, { params }).then(r => r.data)
  },

  criar(dados: DiariaRequest): Promise<Diaria> {
    return api.post<Diaria>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: DiariaRequest): Promise<Diaria> {
    return api.put<Diaria>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
