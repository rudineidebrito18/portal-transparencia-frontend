import { api } from '@/services/api'
import { AnexoConcurso, AnexoConcursoRequest, Concurso, ConcursoRequest } from './types'

const BASE = '/recursos-humanos/concursos'

export const concursoService = {
  listar(): Promise<Concurso[]> {
    return api.get<Concurso[]>(BASE).then(r => r.data)
  },

  buscarPorId(id: number): Promise<Concurso> {
    return api.get<Concurso>(`${BASE}/${id}`).then(r => r.data)
  },

  criar(dados: ConcursoRequest): Promise<Concurso> {
    return api.post<Concurso>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: ConcursoRequest): Promise<Concurso> {
    return api.put<Concurso>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}

export const anexoConcursoService = {
  listarPorConcurso(concursoId: number): Promise<AnexoConcurso[]> {
    return api.get<AnexoConcurso[]>(`${BASE}/${concursoId}/anexos`).then(r => r.data)
  },

  criar(concursoId: number, dados: AnexoConcursoRequest, arquivo: File): Promise<AnexoConcurso> {
    const formData = new FormData()
    formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    formData.append('arquivo', arquivo)

    return api
      .post<AnexoConcurso>(`${BASE}/${concursoId}/anexos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/anexos/${id}`).then(() => undefined)
  }
}
