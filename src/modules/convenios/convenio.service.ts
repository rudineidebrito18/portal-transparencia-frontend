import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  transferenciasRecebidasMock,
  transferenciasRealizadasMock,
  acordosFirmadosMock
} from './mocks/convenio.mock'
import { ConvenioDocumento, FiltroConvenio } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroConvenio & {
  page?: number
  size?: number
  sort?: string
}

interface MockConvenio {
  listar(params: ListarParams): Promise<Page<ConvenioDocumento>>
}

// path já inclui o segmento final ("/filtro" é adicionado aqui) — os 3 recursos de
// convênios têm basePaths diferentes no backend, então cada um vira um serviço próprio.
function criarServicoConvenio(path: string, mock: MockConvenio) {
  return {
    listar(params: ListarParams): Promise<Page<ConvenioDocumento>> {
      if (USE_MOCK) return mock.listar(params)

      return api
        .get<Page<ConvenioDocumento>>(`/${path}/filtro`, { params })
        .then(response => response.data)
    }
  }
}

export const transferenciasRecebidasService = criarServicoConvenio(
  'convenios-transferencias-recebidas',
  transferenciasRecebidasMock
)

export const transferenciasRealizadasService = criarServicoConvenio(
  'convenios-transferencias-realizadas',
  transferenciasRealizadasMock
)

export const acordosFirmadosService = criarServicoConvenio(
  'convenios/acordos-firmados-orgao',
  acordosFirmadosMock
)
