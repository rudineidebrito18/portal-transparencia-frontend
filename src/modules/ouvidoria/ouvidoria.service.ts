import { api } from '@/services/api'
import { ouvidoriaMock } from './mocks/ouvidoria.mock'
import { InformacoesOuvidoria } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const ouvidoriaService = {
  buscarInformacoes(): Promise<InformacoesOuvidoria> {
    if (USE_MOCK) return ouvidoriaMock.buscarInformacoes()

    return api.get<InformacoesOuvidoria>('/ouvidoria/info').then(r => r.data)
  }
}
