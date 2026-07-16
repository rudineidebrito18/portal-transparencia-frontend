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

// Avisos (seção 6.9 do prompt do admin) é JSON puro, sem arquivo, ROLE_MANAGER
// pode tudo. Notícias saiu desse padrão em 2026-07-16 — ver noticiaAdminService
// abaixo — não reaproveitar esta fábrica pra ela.
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

const NOTICIAS_BASE = '/institucional/noticias'

// Notícias passou a aceitar imagem opcional (PNG/JPEG) em 2026-07-16 — o
// backend exige multipart/form-data (parte "dados" + "imagem" opcional) pra
// criar/atualizar, mesmo padrão de unidadesService em geral.service.ts.
function montarFormData(dados: ConteudoInstitucionalRequest, imagem?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (imagem) formData.append('imagem', imagem)
  return formData
}

export const noticiaAdminService = {
  listar(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
    return api.get<Page<ConteudoInstitucional>>(NOTICIAS_BASE, { params }).then(r => r.data)
  },

  criar(dados: ConteudoInstitucionalRequest, imagem?: File | null): Promise<ConteudoInstitucional> {
    return api
      .post<ConteudoInstitucional>(NOTICIAS_BASE, montarFormData(dados, imagem), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: ConteudoInstitucionalRequest, imagem?: File | null): Promise<ConteudoInstitucional> {
    return api
      .put<ConteudoInstitucional>(`${NOTICIAS_BASE}/${id}`, montarFormData(dados, imagem), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${NOTICIAS_BASE}/${id}`).then(() => undefined)
  }
}
