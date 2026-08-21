import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { FiltroTabelaValores, TabelaValores } from './types'

type ListarParams = FiltroTabelaValores & {
  page?: number
  size?: number
  sort?: string
}

export const tabelaValoresService = {
  listar(params: ListarParams): Promise<Page<TabelaValores>> {
    return api
      .get<Page<TabelaValores>>('/tabela-valores/buscar', { params })
      .then(response => response.data)
  },

  urlArquivo(id: number): string {
    return urlArquivoDocumento('tabela-valores', id)
  }
}
