import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  FolhaPagamento,
  FolhaPagamentoRequest,
  FolhaPagamentoServidor,
  ImportacaoFolhaDetalhe,
  ImportacaoFolhaPreview,
  ImportacaoFolhaResumo
} from './types'

const BASE = '/recursos-humanos/folha'

export const folhaService = {
  listarPorServidor(servidorId: number): Promise<FolhaPagamento[]> {
    return api.get<FolhaPagamento[]>(`${BASE}/servidor/${servidorId}`).then(r => r.data)
  },

  criar(servidorId: number, dados: FolhaPagamentoRequest): Promise<FolhaPagamento> {
    return api.post<FolhaPagamento>(`${BASE}/servidor/${servidorId}`, dados).then(r => r.data)
  },

  // Admin-only no backend — confirma com ConfirmDialog antes de chamar.
  atualizar(id: number, dados: FolhaPagamentoRequest): Promise<FolhaPagamento> {
    return api.put<FolhaPagamento>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  // Admin-only no backend — confirma com ConfirmDialog antes de chamar.
  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },

  // Backend agora pagina esse GET — pedimos uma página grande porque a tela
  // não pagina a folha do mês, só lista tudo de uma vez.
  listarPorMes(mes: number, ano: number): Promise<FolhaPagamentoServidor[]> {
    return api
      .get<Page<FolhaPagamentoServidor>>(`${BASE}/por-mes`, { params: { mes, ano, size: 1000 } })
      .then(r => r.data.content)
  },

  // Rubricas.CSV foi descontinuado (V50) — a importação recebe só o Servidores.CSV (resumo por
  // servidor, pipe-delimited, sem cabeçalho). Mês/ano vêm do próprio arquivo.
  previewImportacao(arquivoServidores: File): Promise<ImportacaoFolhaPreview> {
    const formData = new FormData()
    formData.append('arquivoServidores', arquivoServidores)

    return api
      .post<ImportacaoFolhaPreview>(`${BASE}/importar/preview`, formData)
      .then(r => r.data)
  },

  importar(arquivoServidores: File): Promise<ImportacaoFolhaDetalhe> {
    const formData = new FormData()
    formData.append('arquivoServidores', arquivoServidores)

    return api
      .post<ImportacaoFolhaDetalhe>(`${BASE}/importar`, formData)
      .then(r => r.data)
  },

  listarImportacoes(page: number, size = 10): Promise<Page<ImportacaoFolhaResumo>> {
    return api
      .get<Page<ImportacaoFolhaResumo>>(`${BASE}/importacoes`, { params: { page, size, sort: 'dataImportacao,desc' } })
      .then(r => r.data)
  },

  buscarImportacao(id: number): Promise<ImportacaoFolhaDetalhe> {
    return api.get<ImportacaoFolhaDetalhe>(`${BASE}/importacoes/${id}`).then(r => r.data)
  },

  // Admin-only no backend — confirma com ConfirmDialog antes de chamar.
  excluirUltimaImportacao(): Promise<void> {
    return api.delete(`${BASE}/importacoes/ultima`).then(() => undefined)
  }
}
