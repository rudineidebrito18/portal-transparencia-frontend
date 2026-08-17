import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { FonteEmenda, OrigemCadastroEmenda } from '../enums'
import { EmendaEstadual, FiltroEmendaEstadual } from '../types'

type ListParams = FiltroEmendaEstadual & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2022, 2023, 2024, 2025, 2026]
const MODALIDADES = ['90-Aplicações Diretas', '41-Transferências a Municípios - Fundo a Fundo', '40-Transferências a Municípios']

function gerarEmenda(id: number): EmendaEstadual {
  faker.seed(id + 42_000)

  const ano = faker.helpers.arrayElement(ANOS)
  const valorSolicitado = faker.number.float({ min: 50_000, max: 1_500_000, multipleOf: 0.02 })
  const valorPago = faker.helpers.maybe(
    () => faker.number.float({ min: 0, max: valorSolicitado, multipleOf: 0.02 }),
    { probability: 0.6 }
  ) ?? null
  const origemCadastro = faker.helpers.arrayElement(Object.values(OrigemCadastroEmenda))

  return {
    id,
    codigoEmenda: `EPI.${ano}.${faker.string.numeric(5)}`,
    ano,
    parlamentarNome: faker.person.fullName().toUpperCase(),
    tipo: 'EMENDA PARLAMENTAR',
    modalidade: faker.helpers.arrayElement(MODALIDADES),
    unidadeGestora: faker.string.numeric(6),
    nomeUnidadeGestora: faker.helpers.arrayElement(['Saúde (FES / Unidade Central)', 'Secretaria de Governo', 'Secretaria de Agricultura Familiar']),
    empenhos: faker.helpers.maybe(() => `${ano}NE${faker.string.numeric(6)}`) ?? null,
    entidadeBeneficiada: null,
    localizadorGasto: 'LAGO DOS RODRIGUES',
    objeto: faker.lorem.sentence(10),
    funcao: faker.helpers.arrayElement(['Saúde', 'Administração', 'Agricultura']),
    subfuncao: faker.helpers.arrayElement(['Assistência Hospitalar e Ambulatorial', 'Infraestrutura Urbana', 'Promoção da Produção Agropecuária']),
    acao: faker.lorem.words(4),
    subacao: faker.string.numeric(5),
    valorSolicitado,
    valorRepasse: valorSolicitado,
    valorPreEmpenhado: valorPago,
    valorEmpenhado: valorPago,
    valorLiquidado: valorPago,
    valorPago,
    codigoFavorecido: faker.string.numeric(14),
    dataUltimaAtualizacaoFonte: faker.date.recent({ days: 60 }).toISOString(),
    fonteOrigem: FonteEmenda.MA_ESTADUAL,
    origemCadastro,
    linkDetalhes: null,
    dataUltimaSincronizacao: origemCadastro === OrigemCadastroEmenda.API ? faker.date.recent({ days: 2 }).toISOString() : null,
    criadoEm: faker.date.past({ years: 1 }).toISOString(),
    atualizadoEm: faker.date.recent({ days: 30 }).toISOString()
  }
}

const TOTAL_MOCK = 30
const emendas: EmendaEstadual[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarEmenda(i + 1))

export const emendaEstadualMock = {
  async listar(params: ListParams): Promise<Page<EmendaEstadual>> {
    const { page = 0, size = 10, sort, ano } = params

    let dados = emendas
    if (ano !== undefined) {
      dados = dados.filter(e => e.ano === Number(ano))
    }

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'atualizadoEm,desc'
    ) as unknown as EmendaEstadual[]

    return paginar(ordenados, page, size)
  }
}
