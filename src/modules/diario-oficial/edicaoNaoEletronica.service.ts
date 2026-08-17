import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { edicaoNaoEletronicaMock } from './mocks/edicaoNaoEletronica.mock'
import { EdicaoNaoEletronica, FiltroEdicaoNaoEletronica } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

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
    if (USE_MOCK) return edicaoNaoEletronicaMock.listar(params)

    return api
      .get<Page<EdicaoNaoEletronica>>('/diario-oficial/edicoes-nao-eletronicas/filtro', { params })
      .then(response => response.data)
  },

  urlArquivo(id: number): string {
    return urlArquivoDocumento('diario-oficial/edicoes-nao-eletronicas', id)
  }
}
