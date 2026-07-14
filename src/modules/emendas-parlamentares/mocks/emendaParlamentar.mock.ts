import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { FormaRepasseEmenda, TipoEmenda } from '../enums'
import { EmendaParlamentar, FiltroEmendaParlamentar } from '../types'

type ListParams = FiltroEmendaParlamentar & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2022, 2023, 2024, 2025, 2026]

function gerarEmenda(id: number): EmendaParlamentar {
  faker.seed(id + 40_000)

  const ano = faker.helpers.arrayElement(ANOS)
  const valorPrevisto = faker.number.float({ min: 20000, max: 800000, multipleOf: 0.02 })
  const valorRepassado = faker.helpers.maybe(
    () => faker.number.float({ min: 0, max: valorPrevisto, multipleOf: 0.02 }),
    { probability: 0.7 }
  ) ?? 0

  return {
    id,
    numero: `${faker.string.numeric(4)}/${ano}`,
    dataPublicacao: faker.date.between({ from: `${ano}-01-01`, to: `${ano}-12-31` }).toISOString().split('T')[0],
    objeto: faker.lorem.sentence(8),
    autoridade: faker.person.fullName(),
    origem: faker.helpers.arrayElement(['Orçamento Geral da União', 'Fundo Nacional de Saúde', 'Fundo Nacional de Educação']),
    tipo: faker.helpers.enumValue(TipoEmenda),
    formaRepasse: faker.helpers.enumValue(FormaRepasseEmenda),
    valorPrevisto,
    valorRepassado,
    linkDetalhes: `https://www.gov.br/transferegov/pt-br/emendas/${id}`
  }
}

const TOTAL_MOCK = 45
const emendas: EmendaParlamentar[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarEmenda(i + 1))

export const emendaParlamentarMock = {
  async listar(params: ListParams): Promise<Page<EmendaParlamentar>> {
    const { page = 0, size = 10, sort, tipo, ano } = params

    let dados = emendas

    if (tipo) {
      dados = dados.filter(e => e.tipo === tipo)
    }
    if (ano !== undefined) {
      dados = dados.filter(e => e.dataPublicacao.startsWith(String(ano)))
    }

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'dataPublicacao,desc'
    ) as unknown as EmendaParlamentar[]

    return paginar(ordenados, page, size)
  }
}
