import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { FiltroTabelaValores, TabelaValores, TipoViagem } from '../types'

type ListParams = FiltroTabelaValores & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2022, 2023, 2024, 2025]

function gerarTabelaValores(id: number): TabelaValores {
  faker.seed(id + 900)

  const ano = faker.helpers.arrayElement(ANOS)
  const tipo = faker.helpers.arrayElement(Object.values(TipoViagem))

  return {
    id,
    tipo,
    descricao: `Tabela de Valores de Diárias - Viagens ${tipo === TipoViagem.NACIONAL ? 'Nacionais' : 'Internacionais'} - ${ano}`,
    data: `${ano}-01-15`,
    caminhoArquivo: `/arquivos/tabela-valores/${id}.pdf`
  }
}

const TOTAL_MOCK = 10
const tabelas: TabelaValores[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarTabelaValores(i + 1))

export const tabelaValoresMock = {
  async listar(params: ListParams): Promise<Page<TabelaValores>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = tabelas

    if (filtros.descricao) {
      dados = dados.filter(d => d.descricao.toLowerCase().includes(String(filtros.descricao).toLowerCase()))
    }
    if (filtros.tipoViagem) {
      dados = dados.filter(d => d.tipo === filtros.tipoViagem)
    }
    if (filtros.dataInicial) {
      const inicio = new Date(String(filtros.dataInicial)).getTime()
      dados = dados.filter(d => new Date(d.data).getTime() >= inicio)
    }
    if (filtros.dataFinal) {
      const fim = new Date(String(filtros.dataFinal)).getTime()
      dados = dados.filter(d => new Date(d.data).getTime() <= fim)
    }

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'data,desc'
    ) as unknown as TabelaValores[]

    return paginar(ordenados, page, size)
  }
}
