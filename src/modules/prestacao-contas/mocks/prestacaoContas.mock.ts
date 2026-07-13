import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { DocumentoPrestacaoContas, FiltroDocumentoPrestacaoContas, RecursoPrestacaoContas } from '../types'

type ListParams = FiltroDocumentoPrestacaoContas & {
  page?: number
  size?: number
  sort?: string
}

const DESCRICOES: Record<RecursoPrestacaoContas, string[]> = {
  'balanco-geral': ['Balanço Geral do Exercício', 'Balanço Orçamentário', 'Balanço Financeiro', 'Balanço Patrimonial'],
  'parecer-previo': ['Parecer Prévio do TCE sobre as Contas do Exercício', 'Parecer Prévio - Contas Anuais'],
  'julgamento-contas-tce': ['Acórdão de Julgamento das Contas - TCE', 'Decisão do Tribunal de Contas'],
  'julgamento-contas-legislativo': ['Decreto Legislativo de Julgamento das Contas', 'Parecer da Câmara Municipal'],
  'prestacao-contas-anos-anteriores': ['Prestação de Contas', 'Relatório de Gestão Fiscal']
}

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025]
const TOTAL_POR_RECURSO = 14

function gerarDocumento(recurso: RecursoPrestacaoContas, id: number): DocumentoPrestacaoContas {
  faker.seed(id + recurso.length * 1000)

  const ano = faker.helpers.arrayElement(ANOS)
  const mes = faker.helpers.arrayElement(['03', '04', '05', '06'])
  const titulo = faker.helpers.arrayElement(DESCRICOES[recurso])

  return {
    id,
    data: `${ano}-${mes}-01`,
    descricao: `${titulo} - ${ano}`,
    caminhoArquivo: `/arquivos/prestacao-contas/${recurso}/${id}.pdf`
  }
}

const cache = new Map<RecursoPrestacaoContas, DocumentoPrestacaoContas[]>()

function obterDocumentos(recurso: RecursoPrestacaoContas): DocumentoPrestacaoContas[] {
  if (!cache.has(recurso)) {
    cache.set(recurso, Array.from({ length: TOTAL_POR_RECURSO }, (_, i) => gerarDocumento(recurso, i + 1)))
  }
  return cache.get(recurso)!
}

export const prestacaoContasMock = {
  async listar(recurso: RecursoPrestacaoContas, params: ListParams): Promise<Page<DocumentoPrestacaoContas>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = obterDocumentos(recurso)

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
    ) as unknown as DocumentoPrestacaoContas[]

    return paginar(ordenados, page, size)
  }
}
