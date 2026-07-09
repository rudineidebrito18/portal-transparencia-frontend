import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { TipoEdicaoDiario } from '../enums'
import { EdicaoDiario } from '../types'

type ListParams = {
  page?: number
  size?: number
  sort?: string
}

function gerarEdicao(numeroEdicao: number): EdicaoDiario {
  faker.seed(numeroEdicao)

  return {
    id: numeroEdicao,
    numeroEdicao,
    dataPublicacao: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
    tipo: faker.helpers.enumValue(TipoEdicaoDiario),
    pathFile: `/diario-oficial/edicoes/${numeroEdicao}.pdf`,
    hash: faker.string.hexadecimal({ length: 32, casing: 'lower', prefix: '' })
  }
}

const TOTAL_MOCK = 80
const edicoes: EdicaoDiario[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarEdicao(TOTAL_MOCK - i))

export const diarioOficialMock = {
  async listar(params: ListParams): Promise<Page<EdicaoDiario>> {
    const { page = 0, size = 10, sort } = params

    const ordenadas = ordenar(edicoes as unknown as Record<string, unknown>[], sort) as unknown as EdicaoDiario[]

    return paginar(ordenadas, page, size)
  }
}
