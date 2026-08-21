import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { ConteudoInstitucional, FiltroConteudoInstitucional, RecursoInstitucional } from './types'

type ListarParams = FiltroConteudoInstitucional & {
  ativo?: boolean
  page?: number
  size?: number
  sort?: string
}

function criarServicoInstitucional(recurso: RecursoInstitucional) {
  return {
    listar(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
      return api
        .get<Page<ConteudoInstitucional>>(`/institucional/${recurso}/filtro`, { params })
        .then(response => response.data)
    },

    buscarPorId(id: number): Promise<ConteudoInstitucional> {
      return api.get<ConteudoInstitucional>(`/institucional/${recurso}/${id}`).then(response => response.data)
    }
  }
}

export const noticiaService = criarServicoInstitucional('noticias')
export const avisoService = criarServicoInstitucional('avisos')
