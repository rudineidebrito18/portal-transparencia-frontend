import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { ConteudoInstitucional, RecursoInstitucional } from '@/modules/institucional/types'

export interface ConteudoInstitucionalRequest {
  titulo: string
  texto: string
  data: string
  ativo: boolean
}

type ListarParams = {
  ativo?: boolean
  page?: number
  size?: number
  sort?: string
}

// Avisos e Notícias (seção 6.9 do prompt do admin) têm exatamente a mesma
// forma — JSON puro, sem arquivo, ROLE_MANAGER pode tudo.
function criarServicoAdminInstitucional(recurso: RecursoInstitucional) {
  const base = `/institucional/${recurso}`

  return {
    listar(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
      return api.get<Page<ConteudoInstitucional>>(base, { params }).then(r => r.data)
    },

    criar(dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional> {
      return api.post<ConteudoInstitucional>(base, dados).then(r => r.data)
    },

    atualizar(id: number, dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional> {
      return api.put<ConteudoInstitucional>(`${base}/${id}`, dados).then(r => r.data)
    },

    excluir(id: number): Promise<void> {
      return api.delete(`${base}/${id}`).then(() => undefined)
    }
  }
}

export const avisoAdminService = criarServicoAdminInstitucional('avisos')
export const noticiaAdminService = criarServicoAdminInstitucional('noticias')
