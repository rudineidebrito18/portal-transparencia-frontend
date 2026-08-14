import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
  FiltroEmpresaDividaAtiva,
  FiltroEmpresaInidonea,
  FiltroRelatorioExecucaoOrcamentaria,
  FiltroRelatorioGestaoFiscal,
  RelatorioExecucaoOrcamentaria,
  RelatorioGestaoFiscal
} from '../types'

function gerarEmpresasDividaAtiva(): EmpresaDividaAtiva[] {
  faker.seed(501)

  return Array.from({ length: 12 }, (_, i) => {
    const nome = faker.company.name()

    return {
      id: i + 1,
      nome,
      razaoSocial: `${nome} LTDA`,
      cnpj: faker.string.numeric(14),
      descricao: 'Inscrição em Dívida Ativa Municipal',
      data: faker.date.between({ from: '2022-01-01', to: '2025-12-31' }).toISOString().split('T')[0],
      valor: faker.number.float({ min: 1000, max: 250000, multipleOf: 0.01 }),
      caminhoPdf: `/arquivos/gestao-fiscal/divida-ativa/${i + 1}.pdf`
    }
  })
}

function gerarEmpresasInidoneas(): EmpresaInidonea[] {
  faker.seed(502)

  const status = ['Suspensa', 'Inidônea', 'Impedida de Licitar']
  const motivos = ['Fraude em licitação', 'Descumprimento contratual', 'Inexecução total do contrato']

  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    empresa: faker.company.name(),
    cnpj: faker.string.numeric(14),
    descricao: faker.helpers.arrayElement(motivos),
    status: faker.helpers.arrayElement(status),
    data: faker.date.between({ from: '2022-01-01', to: '2025-12-31' }).toISOString().split('T')[0],
    caminhoPdf: `/arquivos/gestao-fiscal/inidoneas/${i + 1}.pdf`
  }))
}

function gerarRelatoriosExecucaoOrcamentaria(): RelatorioExecucaoOrcamentaria[] {
  faker.seed(503)

  const registros: RelatorioExecucaoOrcamentaria[] = []
  let id = 1

  for (const ano of [2023, 2024, 2025]) {
    for (let bimestre = 1; bimestre <= 6; bimestre++) {
      if (ano === 2025 && bimestre > 3) continue

      registros.push({
        id: id++,
        descricao: `Relatório Resumido de Execução Orçamentária - ${bimestre}º Bimestre`,
        bimestre,
        ano,
        caminhoPdf: `/arquivos/gestao-fiscal/execucao-orcamentaria/${ano}-${bimestre}.pdf`,
        caminhoWord: `/arquivos/gestao-fiscal/execucao-orcamentaria/${ano}-${bimestre}.docx`,
        caminhoXls: `/arquivos/gestao-fiscal/execucao-orcamentaria/${ano}-${bimestre}.xlsx`
      })
    }
  }

  return registros.reverse()
}

function gerarRelatoriosGestaoFiscal(): RelatorioGestaoFiscal[] {
  faker.seed(504)

  const registros: RelatorioGestaoFiscal[] = []
  let id = 1

  for (const ano of [2023, 2024, 2025]) {
    for (const periodo of ['PRIMEIRO_QUADRIMESTRE', 'SEGUNDO_QUADRIMESTRE', 'TERCEIRO_QUADRIMESTRE'] as const) {
      if (ano === 2025 && periodo !== 'PRIMEIRO_QUADRIMESTRE') continue

      registros.push({
        id: id++,
        ano,
        periodo,
        caminhoPdf: `/arquivos/gestao-fiscal/rgf/${ano}-${periodo}.pdf`,
        caminhoWord: `/arquivos/gestao-fiscal/rgf/${ano}-${periodo}.docx`,
        caminhoXls: `/arquivos/gestao-fiscal/rgf/${ano}-${periodo}.xlsx`
      })
    }
  }

  return registros.reverse()
}

type ListarParams<F> = F & { page?: number; size?: number; sort?: string }

export const gestaoFiscalMock = {
  async listarEmpresasDividaAtiva(params: ListarParams<FiltroEmpresaDividaAtiva>): Promise<Page<EmpresaDividaAtiva>> {
    const { page, size, sort, nome, razaoSocial, cnpj, dataInicial, dataFinal } = params

    let dados = gerarEmpresasDividaAtiva()
    if (nome) dados = dados.filter(e => e.nome.toLowerCase().includes(nome.toLowerCase()))
    if (razaoSocial) dados = dados.filter(e => e.razaoSocial.toLowerCase().includes(razaoSocial.toLowerCase()))
    if (cnpj) dados = dados.filter(e => e.cnpj.includes(cnpj))
    if (dataInicial) dados = dados.filter(e => e.data >= dataInicial)
    if (dataFinal) dados = dados.filter(e => e.data <= dataFinal)

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'data,desc'
    ) as unknown as EmpresaDividaAtiva[]

    return paginar(ordenados, page, size)
  },

  async listarEmpresasInidoneas(params: ListarParams<FiltroEmpresaInidonea>): Promise<Page<EmpresaInidonea>> {
    const { page, size, sort, empresa, cnpj, status, dataInicial, dataFinal } = params

    let dados = gerarEmpresasInidoneas()
    if (empresa) dados = dados.filter(e => e.empresa.toLowerCase().includes(empresa.toLowerCase()))
    if (cnpj) dados = dados.filter(e => e.cnpj.includes(cnpj))
    if (status) dados = dados.filter(e => e.status.toLowerCase().includes(status.toLowerCase()))
    if (dataInicial) dados = dados.filter(e => e.data >= dataInicial)
    if (dataFinal) dados = dados.filter(e => e.data <= dataFinal)

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'data,desc'
    ) as unknown as EmpresaInidonea[]

    return paginar(ordenados, page, size)
  },

  async listarRelatoriosExecucaoOrcamentaria(params: ListarParams<FiltroRelatorioExecucaoOrcamentaria>): Promise<Page<RelatorioExecucaoOrcamentaria>> {
    const { page, size, sort, ano, bimestre, descricao } = params

    let dados = gerarRelatoriosExecucaoOrcamentaria()
    if (ano) dados = dados.filter(r => r.ano === ano)
    if (bimestre) dados = dados.filter(r => r.bimestre === bimestre)
    if (descricao) dados = dados.filter(r => r.descricao.toLowerCase().includes(descricao.toLowerCase()))

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'ano,desc'
    ) as unknown as RelatorioExecucaoOrcamentaria[]

    return paginar(ordenados, page, size)
  },

  async listarRelatoriosGestaoFiscal(params: ListarParams<FiltroRelatorioGestaoFiscal>): Promise<Page<RelatorioGestaoFiscal>> {
    const { page, size, sort, ano, periodo } = params

    let dados = gerarRelatoriosGestaoFiscal()
    if (ano) dados = dados.filter(r => r.ano === ano)
    if (periodo) dados = dados.filter(r => r.periodo.toLowerCase().includes(periodo.toLowerCase()))

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
      sort ?? 'ano,desc'
    ) as unknown as RelatorioGestaoFiscal[]

    return paginar(ordenados, page, size)
  }
}
