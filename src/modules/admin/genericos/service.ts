import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  DocumentoGenericoAdmin,
  DocumentoGenericoComIntervaloAdmin,
  DocumentoGenericoRequest,
  FiltroDocumentoGenericoAdmin
} from './types'

type ListarParams = FiltroDocumentoGenericoAdmin & {
  page?: number
  size?: number
  sort?: string
}

function montarFormData(dados: DocumentoGenericoRequest, arquivo?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (arquivo) formData.append('arquivo', arquivo)
  return formData
}

// Motor de CRUD pros ~24 módulos do "padrão genérico" (seção 6.7 do prompt do
// admin) — cobre as duas variantes (simples e com intervalo de data) porque
// o request/response é um superconjunto do outro (dataInicio/dataFim ficam
// undefined na variante simples).
export function criarServicoAdminDocumentoGenerico<
  T extends DocumentoGenericoAdmin | DocumentoGenericoComIntervaloAdmin = DocumentoGenericoAdmin
>(basePath: string) {
  return {
    listar(params: ListarParams): Promise<Page<T>> {
      return api.get<Page<T>>(`${basePath}/filtro`, { params }).then(r => r.data)
    },

    obter(id: number): Promise<T> {
      return api.get<T>(`${basePath}/${id}`).then(r => r.data)
    },

    criar(dados: DocumentoGenericoRequest, arquivo: File): Promise<T> {
      return api
        .post<T>(basePath, montarFormData(dados, arquivo), {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(r => r.data)
    },

    atualizar(id: number, dados: DocumentoGenericoRequest, arquivo?: File | null): Promise<T> {
      return api
        .put<T>(`${basePath}/${id}`, montarFormData(dados, arquivo), {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(r => r.data)
    },

    excluir(id: number): Promise<void> {
      return api.delete(`${basePath}/${id}`).then(() => undefined)
    }
  }
}
