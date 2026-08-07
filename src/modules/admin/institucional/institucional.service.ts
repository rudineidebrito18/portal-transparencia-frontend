import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { ConteudoInstitucional, ImagemNoticia, RecursoInstitucional } from '@/modules/institucional/types'

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

// Notícias aceita N imagens (com uma marcada como principal) via sub-recurso —
// confirmado contra o /v3/api-docs real do backend (implementado exatamente como
// pedido em prompt-backend-imagens-noticias.md), com 2 detalhes de contrato:
// - criar/atualizar só aceitam 1 imagem no multipart (campo "imagem", legado) — imagens
//   extras entram depois, uma a uma, via POST .../imagens.
// - POST .../imagens recebe "principal" como query param, não como campo do FormData.
// - PUT .../{id} exige multipart mesmo sem imagem nova (dados é a única parte obrigatória).
function montarFormDataDados(dados: ConteudoInstitucionalRequest): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  return formData
}

export const noticiaAdminService = {
  listar(params: ListarParams): Promise<Page<ConteudoInstitucional>> {
    return api.get<Page<ConteudoInstitucional>>(NOTICIAS_BASE, { params }).then(r => r.data)
  },

  criar(dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional> {
    return api
      .post<ConteudoInstitucional>(NOTICIAS_BASE, montarFormDataDados(dados), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional> {
    return api
      .put<ConteudoInstitucional>(`${NOTICIAS_BASE}/${id}`, montarFormDataDados(dados), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${NOTICIAS_BASE}/${id}`).then(() => undefined)
  },

  adicionarImagem(noticiaId: number, imagem: File, principal: boolean): Promise<ImagemNoticia> {
    const formData = new FormData()
    formData.append('imagem', imagem)
    return api
      .post<ImagemNoticia>(`${NOTICIAS_BASE}/${noticiaId}/imagens`, formData, {
        params: { principal },
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  removerImagem(noticiaId: number, imagemId: number): Promise<void> {
    return api.delete(`${NOTICIAS_BASE}/${noticiaId}/imagens/${imagemId}`).then(() => undefined)
  },

  marcarPrincipal(noticiaId: number, imagemId: number): Promise<ImagemNoticia> {
    return api.put<ImagemNoticia>(`${NOTICIAS_BASE}/${noticiaId}/imagens/${imagemId}/principal`).then(r => r.data)
  }
}
