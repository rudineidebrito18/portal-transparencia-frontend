import { api } from '@/services/api'
import { Decreto, DocumentoUnidade, PessoaCargoUnidade, SetorUnidade, Unidade } from './types'

const BASE = '/geral/unidades'

export const secretariasService = {
  listar(params?: { nome?: string; vigencia?: string }): Promise<Unidade[]> {
    return api.get<Unidade[]>(BASE, { params }).then(r => r.data)
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
