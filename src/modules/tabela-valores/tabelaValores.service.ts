import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { tabelaValoresMock } from './mocks/tabelaValores.mock'
import { FiltroTabelaValores, TabelaValores } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroTabelaValores & {
  page?: number
  size?: number
  sort?: string
}

export const tabelaValoresService = {
  listar(params: ListarParams): Promise<Page<TabelaValores>> {
    if (USE_MOCK) return tabelaValoresMock.listar(params)

    return api
      .get<Page<TabelaValores>>('/tabela-valores/buscar', { params })
      .then(response => response.data)
  }
}
