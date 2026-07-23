import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { concursoMock } from './mocks/concurso.mock'
import { AnexoConcurso, Concurso, FiltroConcurso } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroConcurso & { page?: number; size?: number; sort?: string }

export const concursoService = {
  listar(params: ListarParams): Promise<Page<Concurso>> {
    if (USE_MOCK) return concursoMock.listar(params)

    return api.get<Page<Concurso>>('/recursos-humanos/concursos/filtro', { params }).then(r => r.data)
  },

  listarAnexos(concursoId: number): Promise<AnexoConcurso[]> {
    if (USE_MOCK) return concursoMock.listarAnexos(concursoId)

    return api
      .get<AnexoConcurso[]>(`/recursos-humanos/concursos/${concursoId}/anexos`)
      .then(r => r.data)
  }
}
