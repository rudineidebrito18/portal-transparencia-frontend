import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { diarioOficialMock } from './mocks/diario-oficial.mock'
import { DiarioOficialInfo, EdicaoDiario, FiltroEdicaoDiario, ValidacaoPublicaDiario } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroEdicaoDiario & {
  page?: number
  size?: number
  sort?: string
}

export const diarioOficialService = {
  listar(params: ListarParams): Promise<Page<EdicaoDiario>> {
    if (USE_MOCK) return diarioOficialMock.listar(params)

    return api
      .get<Page<EdicaoDiario>>('/edicoes/filtro', { params })
      .then(response => response.data)
  }
}

export function urlDownloadEdicao(numeroEdicao: number): string {
  return `/api/edicoes/${numeroEdicao}/download`
}

// GET /diario-oficial já é público (sem auth, confirmado via curl) — mesmo endpoint que o
// admin usa em src/modules/admin/diario-oficial/diarioOficial.service.ts, só que aqui só
// leitura (usado nas abas Quem Somos/Expediente).
export const diarioOficialInfoService = {
  buscar(): Promise<DiarioOficialInfo> {
    return api.get<DiarioOficialInfo>('/diario-oficial').then(r => r.data)
  }
}

// GET /edicoes/{numero}/validar — endpoint público já existente no backend (é o destino do
// QR Code impresso na última página de cada edição), sem consumidor no front até essa aba.
export const validacaoEdicaoService = {
  validar(numeroEdicao: number): Promise<ValidacaoPublicaDiario> {
    return api.get<ValidacaoPublicaDiario>(`/edicoes/${numeroEdicao}/validar`).then(r => r.data)
  }
}
