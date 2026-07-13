import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { ConvenioDocumento, FiltroConvenio } from '../types'

type ListParams = FiltroConvenio & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2021, 2022, 2023, 2024, 2025]

function criarMockConvenio(descricoes: string[], pasta: string, seed: number, total = 12) {
  let cache: ConvenioDocumento[] | null = null

  function gerarDocumento(id: number): ConvenioDocumento {
    faker.seed(id + seed)

    const ano = faker.helpers.arrayElement(ANOS)
    const dataInicio = faker.date.between({ from: `${ano}-01-01`, to: `${ano}-06-30` })
    const dataFim = faker.date.soon({ days: 180, refDate: dataInicio })
    const titulo = faker.helpers.arrayElement(descricoes)

    return {
      id,
      data: dataInicio.toISOString().split('T')[0],
      descricao: `${titulo} - ${ano}`,
      caminhoArquivo: `/arquivos/${pasta}/${id}.pdf`,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    }
  }

  function obterDocumentos(): ConvenioDocumento[] {
    if (!cache) {
      cache = Array.from({ length: total }, (_, i) => gerarDocumento(i + 1))
    }
    return cache
  }

  return {
    async listar(params: ListParams): Promise<Page<ConvenioDocumento>> {
      const { page = 0, size = 10, sort, ...filtros } = params

      let dados = obterDocumentos()

      if (filtros.descricao) {
        dados = dados.filter(d => d.descricao.toLowerCase().includes(String(filtros.descricao).toLowerCase()))
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
      ) as unknown as ConvenioDocumento[]

      return paginar(ordenados, page, size)
    }
  }
}

export const transferenciasRecebidasMock = criarMockConvenio(
  ['Convênio com o Governo Federal', 'Convênio com o Governo Estadual', 'Termo de Cooperação Técnica'],
  'convenios/transferencias-recebidas',
  701
)

export const transferenciasRealizadasMock = criarMockConvenio(
  ['Repasse a Associação Comunitária', 'Repasse a Entidade Filantrópica', 'Convênio com Consórcio Intermunicipal'],
  'convenios/transferencias-realizadas',
  702
)

export const acordosFirmadosMock = criarMockConvenio(
  ['Acordo de Cooperação Técnica', 'Termo de Ajuste de Conduta', 'Acordo de Parceria Institucional'],
  'convenios/acordos-firmados',
  703
)
