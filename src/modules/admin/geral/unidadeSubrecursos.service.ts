import { api } from '@/services/api'
import {
  Decreto,
  DecretoRequest,
  DocumentoUnidade,
  DocumentoUnidadeRequest,
  GestorUnidade,
  GestorUnidadeRequest,
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
      .post<Decreto>(`${BASE}/${unidadeId}/decretos`, montarFormDataArquivo(dados, arquivo))
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
      .post<DocumentoUnidade>(`${BASE}/${unidadeId}/documentos`, montarFormDataArquivo(dados, arquivo))
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/documentos/${id}`).then(() => undefined)
  }
}

// Ordenador de despesa: JSON puro, só criar + listar + excluir (sem edição —
// excluir e recriar faz as vezes). Gestor divergiu desse formato em 2026-08-05
// (ver gestorUnidadeService abaixo) — não compartilha mais fábrica com Ordenador.
function criarServicoPessoaCargo(recurso: 'ordenadores') {
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

export const ordenadorUnidadeService = criarServicoPessoaCargo('ordenadores')

function montarFormDataGestor(dados: GestorUnidadeRequest, foto?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (foto) formData.append('foto', foto)
  return formData
}

// Gestor agora é histórico com um vigente por unidade (renomeado de /ex-gestores em
// 2026-08-05). criar() sempre cria um novo registro E o torna vigente (desativa o
// anterior) — não existe mais "editar o gestor atual" direto, só corrigir um registro
// existente (atualizar, sem mexer em quem está ativo) ou reativar um antigo do
// histórico (ativar). excluir é admin-only no backend (MANAGER toma 403) — a tela
// verifica isAdministrador direto em vez de usar podeExcluir(usuario, 'geral')
// (que resolveria MANAGER, certo pros outros sub-recursos de Unidade, errado aqui).
export const gestorUnidadeService = {
  listarPorUnidade(unidadeId: number): Promise<GestorUnidade[]> {
    return api.get<GestorUnidade[]>(`${BASE}/${unidadeId}/gestores`).then(r => r.data)
  },

  criar(unidadeId: number, dados: GestorUnidadeRequest, foto?: File | null): Promise<GestorUnidade> {
    return api
      .post<GestorUnidade>(`${BASE}/${unidadeId}/gestores`, montarFormDataGestor(dados, foto))
      .then(r => r.data)
  },

  atualizar(unidadeId: number, gestorId: number, dados: GestorUnidadeRequest, foto?: File | null): Promise<GestorUnidade> {
    return api
      .put<GestorUnidade>(`${BASE}/${unidadeId}/gestores/${gestorId}`, montarFormDataGestor(dados, foto))
      .then(r => r.data)
  },

  ativar(unidadeId: number, gestorId: number): Promise<GestorUnidade> {
    return api.patch<GestorUnidade>(`${BASE}/${unidadeId}/gestores/${gestorId}/ativar`).then(r => r.data)
  },

  excluir(unidadeId: number, gestorId: number): Promise<void> {
    return api.delete(`${BASE}/${unidadeId}/gestores/${gestorId}`).then(() => undefined)
  }
}

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
