import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { Decreto, DocumentoUnidade, PessoaCargoUnidade, SetorUnidade, Unidade } from './types'

const BASE = '/geral/unidades'

export const secretariasService = {
  // Backend pagina esse GET, mas a tela pública não tem UI de paginação (lista de
  // secretarias é naturalmente pequena) — pede uma página grande e usa só .content,
  // mesmo padrão de gestao-fiscal/aditivos.
  listar(params?: { nome?: string; vigencia?: string; sort?: string }): Promise<Unidade[]> {
    return api
      .get<Page<Unidade>>(BASE, { params: { ...params, size: 200 } })
      .then(r => r.data.content)
  },

  buscarPorId(id: number): Promise<Unidade> {
    return api.get<Unidade>(`${BASE}/${id}`).then(r => r.data)
  },

  listarDecretos(unidadeId: number): Promise<Decreto[]> {
    return api.get<Decreto[]>(`${BASE}/${unidadeId}/decretos`).then(r => r.data)
  },

  listarDocumentos(unidadeId: number): Promise<DocumentoUnidade[]> {
    return api.get<DocumentoUnidade[]>(`${BASE}/${unidadeId}/documentos`).then(r => r.data)
  },

  listarExGestores(unidadeId: number): Promise<PessoaCargoUnidade[]> {
    return api.get<PessoaCargoUnidade[]>(`${BASE}/${unidadeId}/ex-gestores`).then(r => r.data)
  },

  listarOrdenadores(unidadeId: number): Promise<PessoaCargoUnidade[]> {
    return api.get<PessoaCargoUnidade[]>(`${BASE}/${unidadeId}/ordenadores`).then(r => r.data)
  },

  listarSetores(unidadeId: number): Promise<SetorUnidade[]> {
    return api.get<SetorUnidade[]>(`${BASE}/${unidadeId}/setores`).then(r => r.data)
  }
}
