import { fakerPT_BR as faker } from '@faker-js/faker'

import {
  EmpresaDividaAtiva,
  EmpresaInidonea,
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
    for (const periodo of ['1º Quadrimestre', '2º Quadrimestre', '3º Quadrimestre']) {
      if (ano === 2025 && periodo !== '1º Quadrimestre') continue

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

export const gestaoFiscalMock = {
  async listarEmpresasDividaAtiva(): Promise<EmpresaDividaAtiva[]> {
    return gerarEmpresasDividaAtiva()
  },

  async listarEmpresasInidoneas(): Promise<EmpresaInidonea[]> {
    return gerarEmpresasInidoneas()
  },

  async listarRelatoriosExecucaoOrcamentaria(): Promise<RelatorioExecucaoOrcamentaria[]> {
    return gerarRelatoriosExecucaoOrcamentaria()
  },

  async listarRelatoriosGestaoFiscal(): Promise<RelatorioGestaoFiscal[]> {
    return gerarRelatoriosGestaoFiscal()
  }
}
