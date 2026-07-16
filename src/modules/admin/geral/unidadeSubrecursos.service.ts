import { api } from '@/services/api'
import {
  Decreto,
  DecretoRequest,
  DocumentoUnidade,
  DocumentoUnidadeRequest,
  PessoaCargoUnidade,
  PessoaCargoUnidadeRequest,
  SetorUnidade,
  SetorUnidadeRequest
} from './types'

const BASE = '/geral/unidades'

// Os 5 sub-recursos de Unidade não têm edição no backend — só criar + listar +
// excluir (excluir e recriar faz as vezes de editar). Todos os paths de exclusão
// têm "/geral/unidades/" no meio (ex: /geral/unidades/decretos/{id}), não
// "/geral/{recurso}/{id}" direto — confirmado lendo os controllers reais, que
// compartilham o mesmo @RequestMapping("/api/geral/unidades") de base.

function montarFormDataArquivo(dados: object, arquivo: File): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  formData.append('arquivo', arquivo)
  return formData
}

export const decretoUnidadeService = {
  listarPorUnidade(unidadeId: number): Promise<Decreto[]> {
    return api.get<Decreto[]>(`${BASE}/${unidadeId}/decretos`).then(r => r.data)
  },

  criar(unidadeId: number, dados: DecretoRequest, arquivo: File): Promise<Decreto> {
    return api
      .post<Decreto>(`${BASE}/${unidadeId}/decretos`, montarFormDataArquivo(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/decretos/${id}`).then(() => undefined)
  }
}

export const documentoUnidadeService = {
  listarPorUnidade(unidadeId: number): Promise<DocumentoUnidade[]> {
    return api.get<DocumentoUnidade[]>(`${BASE}/${unidadeId}/documentos`).then(r => r.data)
  },

  // Upsert por tipo: reenviar o mesmo tipo substitui o documento anterior.
  enviar(unidadeId: number, dados: DocumentoUnidadeRequest, arquivo: File): Promise<DocumentoUnidade> {
    return api
      .post<DocumentoUnidade>(`${BASE}/${unidadeId}/documentos`, montarFormDataArquivo(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/documentos/${id}`).then(() => undefined)
  }
}

// Ex-gestores e ordenadores de despesa: mesma forma exata (nome, cargo, dataInicio,
// dataFim), JSON puro — só o nome do sub-recurso na URL muda.
function criarServicoPessoaCargo(recurso: 'ex-gestores' | 'ordenadores') {
  return {
    listarPorUnidade(unidadeId: number): Promise<PessoaCargoUnidade[]> {
      return api.get<PessoaCargoUnidade[]>(`${BASE}/${unidadeId}/${recurso}`).then(r => r.data)
    },

    criar(unidadeId: number, dados: PessoaCargoUnidadeRequest): Promise<PessoaCargoUnidade> {
      return api.post<PessoaCargoUnidade>(`${BASE}/${unidadeId}/${recurso}`, dados).then(r => r.data)
    },

    excluir(id: number): Promise<void> {
      return api.delete(`${BASE}/${recurso}/${id}`).then(() => undefined)
    }
  }
}

export const exGestorUnidadeService = criarServicoPessoaCargo('ex-gestores')
export const ordenadorUnidadeService = criarServicoPessoaCargo('ordenadores')

export const setorUnidadeService = {
  listarPorUnidade(unidadeId: number): Promise<SetorUnidade[]> {
    return api.get<SetorUnidade[]>(`${BASE}/${unidadeId}/setores`).then(r => r.data)
  },

  criar(unidadeId: number, dados: SetorUnidadeRequest): Promise<SetorUnidade> {
    return api.post<SetorUnidade>(`${BASE}/${unidadeId}/setores`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/setores/${id}`).then(() => undefined)
  }
}
