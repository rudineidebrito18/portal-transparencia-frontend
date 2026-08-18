import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  FiltroServidor,
  ImportacaoServidorDetalhe,
  ImportacaoServidorPreview,
  ImportacaoServidorResumo,
  Servidor,
  ServidorRequest
} from './types'

const BASE = '/recursos-humanos/servidor'

type ListarParams = FiltroServidor & { page?: number; size?: number; sort?: string }

export const servidorService = {
  listar(params: ListarParams): Promise<Page<Servidor>> {
    return api.get<Page<Servidor>>(`${BASE}/buscar`, { params }).then(r => r.data)
  },

  criar(dados: ServidorRequest): Promise<Servidor> {
    return api.post<Servidor>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: ServidorRequest): Promise<Servidor> {
    return api.put<Servidor>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },

  // Remove 1 cargo — bloqueado no backend para o cargo principal e para o último
  // cargo restante (erro vem na resposta, exibir ao usuário).
  excluirCargo(servidorId: number, cargoId: number): Promise<void> {
    return api.delete(`${BASE}/${servidorId}/cargos/${cargoId}`).then(() => undefined)
  },

  // Prévia da importação de servidores (não salva nada) — o admin revisa unidades sem
  // match antes de confirmar o POST /importar com o mesmo arquivo.
  previewImportacao(arquivo: File): Promise<ImportacaoServidorPreview> {
    const formData = new FormData()
    formData.append('arquivoServidores', arquivo)

    return api
      .post<ImportacaoServidorPreview>(`${BASE}/importar/preview`, formData)
      .then(r => r.data)
  },

  importar(arquivo: File): Promise<ImportacaoServidorDetalhe> {
    const formData = new FormData()
    formData.append('arquivoServidores', arquivo)

    return api
      .post<ImportacaoServidorDetalhe>(`${BASE}/importar`, formData)
      .then(r => r.data)
  },

  listarImportacoes(page: number, size = 10): Promise<Page<ImportacaoServidorResumo>> {
    return api
      .get<Page<ImportacaoServidorResumo>>(`${BASE}/importacoes`, { params: { page, size, sort: 'dataImportacao,desc' } })
      .then(r => r.data)
  },

  buscarImportacao(id: number): Promise<ImportacaoServidorDetalhe> {
    return api.get<ImportacaoServidorDetalhe>(`${BASE}/importacoes/${id}`).then(r => r.data)
  }
}
