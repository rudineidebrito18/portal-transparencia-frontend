import { ApiError, api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { TipoAutoridade } from '@/modules/prefeitura/types'
import { Autoridade, AutoridadeRequest, FiltroFornecedor, FiltroUnidade, Fornecedor, FornecedorRequest, Unidade, UnidadeRequest } from './types'

const FORNECEDORES_BASE = '/geral/fornecedores'

type ListarFornecedoresParams = FiltroFornecedor & { page?: number; size?: number; sort?: string }

export const fornecedoresService = {
  listar(params: ListarFornecedoresParams): Promise<Page<Fornecedor>> {
    return api.get<Page<Fornecedor>>(`${FORNECEDORES_BASE}/filtro`, { params }).then(r => r.data)
  },

  criar(dados: FornecedorRequest): Promise<Fornecedor> {
    return api.post<Fornecedor>(FORNECEDORES_BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: FornecedorRequest): Promise<Fornecedor> {
    return api.put<Fornecedor>(`${FORNECEDORES_BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${FORNECEDORES_BASE}/${id}`).then(() => undefined)
  }
}

const UNIDADES_BASE = '/geral/unidades'

type ListarUnidadesParams = FiltroUnidade & { page?: number; size?: number; sort?: string }

// Unidade voltou a ser JSON puro em 2026-08-05 — o gestor (antes multipart com foto
// embutida no PUT/POST da unidade) virou recurso próprio (GestorUnidade, ver
// unidadeSubrecursos.service.ts), sem vínculo/request aqui.
export const unidadesService = {
  listar(params: ListarUnidadesParams): Promise<Page<Unidade>> {
    return api.get<Page<Unidade>>(UNIDADES_BASE, { params }).then(r => r.data)
  },

  buscarPorId(id: number): Promise<Unidade> {
    return api.get<Unidade>(`${UNIDADES_BASE}/${id}`).then(r => r.data)
  },

  criar(dados: UnidadeRequest): Promise<Unidade> {
    return api.post<Unidade>(UNIDADES_BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: UnidadeRequest): Promise<Unidade> {
    return api.put<Unidade>(`${UNIDADES_BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${UNIDADES_BASE}/${id}`).then(() => undefined)
  }
}

function montarFormDataAutoridade(dados: AutoridadeRequest, foto?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (foto) formData.append('foto', foto)
  return formData
}

// Sem vínculo/FK com Unidade — recurso novo, dois singletons independentes
// (/geral/prefeito, /geral/vice-prefeito), mesmo padrão upsert 404-antes-de-configurar
// de esicInfoService/ouvidoriaInfoService, com upload de foto igual Unidade.
function criarServicoAutoridadeAdmin(tipo: TipoAutoridade) {
  const base = `/geral/${tipo}`

  return {
    buscar(): Promise<Autoridade | null> {
      return api.get<Autoridade>(base).then(
        r => r.data,
        (e: ApiError) => {
          if (e.status === 404) return null
          throw e
        }
      )
    },

    atualizar(dados: AutoridadeRequest, foto?: File | null): Promise<Autoridade> {
      return api
        .put<Autoridade>(base, montarFormDataAutoridade(dados, foto))
        .then(r => r.data)
    }
  }
}

export const prefeitoAdminService = criarServicoAutoridadeAdmin('prefeito')
export const vicePrefeitoAdminService = criarServicoAutoridadeAdmin('vice-prefeito')
