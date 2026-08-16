import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { FonteEmenda, FormaRepasseEmenda, OrigemCadastroEmenda, TipoEmenda } from '../enums'
import { EmendaFederal, FiltroEmendaFederal } from '../types'

type ListParams = FiltroEmendaFederal & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2022, 2023, 2024, 2025, 2026]

function gerarEmenda(id: number): EmendaFederal {
  faker.seed(id + 41_000)

  const ano = faker.helpers.arrayElement(ANOS)
  const valorIndicado = faker.number.float({ min: 100_000, max: 10_000_000, multipleOf: 0.02 })
  const valorEmpenhado = faker.number.float({ min: 0, max: valorIndicado, multipleOf: 0.02 })
  const valorLiquidado = faker.number.float({ min: 0, max: valorEmpenhado, multipleOf: 0.02 })
  const valorPago = faker.number.float({ min: 0, max: valorLiquidado, multipleOf: 0.02 })
  const origemCadastro = faker.helpers.arrayElement(Object.values(OrigemCadastroEmenda))

  return {
    id,
    codigoEmenda: `${ano}${faker.string.numeric(8)}`,
    ano,
    tipoEmenda: faker.helpers.enumValue(TipoEmenda),
    autorNome: faker.person.fullName(),
    autorCargo: faker.helpers.arrayElement(['Deputado Federal', 'Deputada Federal', 'Senador', 'Senadora']),
    autorPartido: faker.helpers.arrayElement(['PCdoB', 'PT', 'MDB', 'PP', 'UNIÃO']),
    autorCodigo: faker.string.numeric(5),
    formaRepasse: faker.helpers.enumValue(FormaRepasseEmenda),
    valorIndicado,
    valorEmpenhado,
    valorLiquidado,
    valorPago,
    situacao: faker.helpers.arrayElement(['Em execução', 'Pago', 'Impedida']),
    localidadeDoGasto: faker.helpers.arrayElement(['MÚLTIPLO', 'LAGO DOS RODRIGUES/MA']),
    objeto: faker.lorem.sentence(8),
    programa: faker.helpers.arrayElement(['FNDE - Educação', 'Fundo Nacional de Saúde', 'Ministério das Cidades']),
    fonteOrigem: faker.helpers.enumValue(FonteEmenda),
    origemCadastro,
    linkDetalhes: `https://www.gov.br/transferegov/pt-br/emendas/${id}`,
    dataUltimaSincronizacao: origemCadastro === OrigemCadastroEmenda.API ? faker.date.recent({ days: 2 }).toISOString() : null,
    criadoEm: faker.date.past({ years: 1 }).toISOString(),
    atualizadoEm: faker.date.recent({ days: 30 }).toISOString()
  }
}

const TOTAL_MOCK = 45
const emendas: EmendaFederal[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarEmenda(i + 1))

export const emendaFederalMock = {
  async listar(params: ListParams): Promise<Page<EmendaFederal>> {
    const { page = 0, size = 10, sort, tipo, ano } = params

    let dados = emendas

    if (tipo) {
      dados = dados.filter(e => e.tipoEmenda === tipo)
    }
    if (ano !== undefined) {
      dados = dados.filter(e => e.ano === Number(ano))
    }

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'atualizadoEm,desc'
    ) as unknown as EmendaFederal[]

    return paginar(ordenados, page, size)
  }
}
