import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
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

    // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
    // Fase 4) via backendFetch, não pela instância axios `api` — ver documentoGenerico.service.ts
    // pro mesmo padrão. NUNCA chamar a partir de um 'use client'.
    listarServidor(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
      return backendFetch<Page<ConteudoInstitucional>>(`/institucional/${recurso}/filtro`, { params })
    },

    buscarPorId(id: number): Promise<ConteudoInstitucional> {
      return api.get<ConteudoInstitucional>(`/institucional/${recurso}/${id}`).then(response => response.data)
    }
  }
}

export const noticiaService = criarServicoInstitucional('noticias')
export const avisoService = criarServicoInstitucional('avisos')
