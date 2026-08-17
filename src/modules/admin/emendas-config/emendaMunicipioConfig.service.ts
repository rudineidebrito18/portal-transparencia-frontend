import { api } from '@/services/api'
import { EmendaMunicipioConfig, EmendaMunicipioConfigRequest } from './types'

const BASE = '/emendas-config'

export const emendaMunicipioConfigService = {
  obter(): Promise<EmendaMunicipioConfig | null> {
    return api.get<EmendaMunicipioConfig | null>(BASE).then(r => r.data)
  },

  atualizar(dados: EmendaMunicipioConfigRequest): Promise<EmendaMunicipioConfig> {
    return api.put<EmendaMunicipioConfig>(BASE, dados).then(r => r.data)
  }
}
