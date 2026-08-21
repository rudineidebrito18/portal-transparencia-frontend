import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '@/modules/shared/types/Page'
import { AnexoConcurso, Concurso, FiltroConcurso } from './types'

type ListarParams = FiltroConcurso & { page?: number; size?: number; sort?: string }

export const concursoService = {
  listar(params: ListarParams): Promise<Page<Concurso>> {
    return api.get<Page<Concurso>>('/recursos-humanos/concursos/filtro', { params }).then(r => r.data)
  },

  // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<Concurso>> {
    return backendFetch<Page<Concurso>>('/recursos-humanos/concursos/filtro', { params })
  },

  listarAnexos(concursoId: number): Promise<AnexoConcurso[]> {
    return api
      .get<AnexoConcurso[]>(`/recursos-humanos/concursos/${concursoId}/anexos`)
      .then(r => r.data)
  },

  buscarPorId(id: number): Promise<Concurso> {
    return api.get<Concurso>(`/recursos-humanos/concursos/${id}`).then(r => r.data)
  },

  urlArquivoAnexo(anexoId: number): string {
    return urlArquivoDocumento('recursos-humanos/concursos/anexos', anexoId)
  }
}
