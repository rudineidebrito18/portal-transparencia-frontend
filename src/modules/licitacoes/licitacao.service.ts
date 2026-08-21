import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { FiltroLicitacao, LicitacaoDetalhe, LicitacaoResumo } from './types'

type ListarParams = FiltroLicitacao & {
  page?: number
  size?: number
  sort?: string
}

export const licitacaoService = {
  listar(params: ListarParams): Promise<Page<LicitacaoResumo>> {
    return api
      .get<Page<LicitacaoResumo>>('/licitacoes/buscar', { params })
      .then(response => response.data)
  },

  buscarPorId(id: number): Promise<LicitacaoDetalhe> {
    return api
      .get<LicitacaoDetalhe>(`/licitacoes/${id}`)
      .then(response => response.data)
  },

  urlDocumento(licitacaoId: number, documentoId: number): string {
    return urlArquivoDocumento(`licitacoes/${licitacaoId}/documentos`, documentoId)
  }
}
