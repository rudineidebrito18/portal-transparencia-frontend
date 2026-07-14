import { api } from '@/services/api'
import { concursoMock } from './mocks/concurso.mock'
import { AnexoConcurso, Concurso } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const concursoService = {
  listar(): Promise<Concurso[]> {
    if (USE_MOCK) return concursoMock.listar()

    return api.get<Concurso[]>('/recursos-humanos/concursos').then(r => r.data)
  },

  listarAnexos(concursoId: number): Promise<AnexoConcurso[]> {
    if (USE_MOCK) return concursoMock.listarAnexos(concursoId)

    return api
      .get<AnexoConcurso[]>(`/recursos-humanos/concursos/${concursoId}/anexos`)
      .then(r => r.data)
  }
}
