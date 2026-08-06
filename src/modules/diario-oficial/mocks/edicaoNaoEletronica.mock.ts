import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { TipoEdicaoDiario } from '../enums'
import { EdicaoNaoEletronica, FiltroEdicaoNaoEletronica } from '../types'

type ListParams = FiltroEdicaoNaoEletronica & {
  page?: number
  size?: number
  sort?: string
}

const DESCRICOES = ['Lei Municipal', 'Decreto', 'Portaria', 'Edital', 'Resolução']

function gerarEdicao(id: number): EdicaoNaoEletronica {
  faker.seed(id + 5000)

  const ano = faker.helpers.arrayElement([2015, 2016, 2017, 2018, 2019, 2020])

  return {
    id,
    volume: `Vol. ${Math.ceil(id / 10)} - Nº ${id}`,
    descricao: `${faker.helpers.arrayElement(DESCRICOES)} ${faker.number.int({ min: 1, max: 300 })}/${ano}`,
    data: faker.date.between({ from: `${ano}-01-01`, to: `${ano}-12-31` }).toISOString().split('T')[0],
    tipo: faker.helpers.enumValue(TipoEdicaoDiario),
    caminhoArquivo: `/diario-oficial/edicoes-nao-eletronicas/${id}.pdf`
  }
}

const TOTAL_MOCK = 40
const edicoes: EdicaoNaoEletronica[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarEdicao(i + 1))

export const edicaoNaoEletronicaMock = {
  async listar(params: ListParams): Promise<Page<EdicaoNaoEletronica>> {
    const { page = 0, size = 10, sort, descricao, tipo, dataInicial, dataFinal } = params

    let dados = edicoes

    if (descricao) {
      dados = dados.filter(e => e.descricao.toLowerCase().includes(String(descricao).toLowerCase()))
    }
    if (tipo) {
      dados = dados.filter(e => e.tipo === tipo)
    }
    if (dataInicial) {
      const inicio = new Date(String(dataInicial)).getTime()
      dados = dados.filter(e => new Date(e.data).getTime() >= inicio)
    }
    if (dataFinal) {
      const fim = new Date(String(dataFinal)).getTime()
      dados = dados.filter(e => new Date(e.data).getTime() <= fim)
    }

    const ordenadas = ordenar(dados as unknown as Record<string, unknown>[], sort ?? 'data,desc') as unknown as EdicaoNaoEletronica[]

    return paginar(ordenadas, page, size)
  }
}
