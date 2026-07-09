import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { institucionalMock } from './mocks/institucional.mock'
import { ConteudoInstitucional, RecursoInstitucional } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = {
  ativo?: boolean
  page?: number
  size?: number
  sort?: string
}

function criarServicoInstitucional(recurso: RecursoInstitucional) {
  return {
    listar(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
      if (USE_MOCK) return institucionalMock.listar(recurso, params)

      return api
        .get<Page<ConteudoInstitucional>>(`/institucional/${recurso}`, { params })
        .then(response => response.data)
    }
  }
}

export const noticiaService = criarServicoInstitucional('noticias')
export const avisoService = criarServicoInstitucional('avisos')
