import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { diarioOficialMock } from './mocks/diario-oficial.mock'
import { EdicaoDiario } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

export const diarioOficialService = {
  listar(params: ListarParams): Promise<Page<EdicaoDiario>> {
    if (USE_MOCK) return diarioOficialMock.listar(params)

    return api
      .get<Page<EdicaoDiario>>('/edicoes', { params })
      .then(response => response.data)
  }
}

export function urlDownloadEdicao(numeroEdicao: number): string {
  return `/api/edicoes/${numeroEdicao}/download`
}
