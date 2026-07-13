import { api } from '@/services/api'
import { esicMock } from './mocks/esic.mock'
import { InformacoesEsic } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const esicService = {
  buscarInformacoes(): Promise<InformacoesEsic> {
    if (USE_MOCK) return esicMock.buscarInformacoes()

    return api.get<InformacoesEsic>('/esic/infos').then(r => r.data)
  }
}
