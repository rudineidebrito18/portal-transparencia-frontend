import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { EdicaoNaoEletronica, FiltroEdicaoNaoEletronica } from './types'

type ListarParams = FiltroEdicaoNaoEletronica & {
  page?: number
  size?: number
  sort?: string
}

// Endpoint novo, ainda não existe no backend (ver prompt-backend-diario-oficial.md) —
// publicações físicas de antes do sistema eletrônico, com campos (volume, tipo) que não
// batem no shape genérico {descricao, data, caminhoArquivo} dos outros ~28 módulos.
export const edicaoNaoEletronicaService = {
  listar(params: ListarParams): Promise<Page<EdicaoNaoEletronica>> {
    return api
      .get<Page<EdicaoNaoEletronica>>('/diario-oficial/edicoes-nao-eletronicas/filtro', { params })
      .then(response => response.data)
  },

  urlArquivo(id: number): string {
    return urlArquivoDocumento('diario-oficial/edicoes-nao-eletronicas', id)
  }
}
