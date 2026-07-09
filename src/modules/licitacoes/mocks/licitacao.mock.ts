import { fakerPT_BR as faker } from '@faker-js/faker'

import { Page } from '@/modules/shared/types/Page'
import { criarErroNaoEncontrado, ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { StatusLicitacao, TipoProcedimentoLicitacao } from '../enums'
import { DocumentoLicitacao, FiltroLicitacao, LicitacaoDetalhe, LicitacaoResumo } from '../types'

export interface LicitacaoCompleta extends LicitacaoDetalhe {
  id: number
}

type ListParams = FiltroLicitacao & {
  page?: number
  size?: number
  sort?: string
}

function gerarDocumentos(quantidade: number): DocumentoLicitacao[] {
  const tipos = ['Edital', 'Anexo', 'Ata de Reunião', 'Termo de Referência', 'Homologação']
  const assuntos = [
    'Documentação técnica para análise',
    'Publicação de resultado preliminar',
    'Abertura de certame licitatório',
    'Minuta do contrato administrativo',
    'Parecer jurídico de aprovação'
  ]

  return Array.from({ length: quantidade }, (_, i) => ({
    assunto: faker.helpers.arrayElement(assuntos),
    tipoDocumento: faker.helpers.arrayElement(tipos),
    dataEnvio: faker.date.recent().toISOString().split('T')[0],
    caminhoPdf: `/arquivos/exemplo_${i + 1}.pdf`
  }))
}

function gerarLicitacao(id: number): LicitacaoCompleta {
  faker.seed(id)

  const ano = faker.helpers.arrayElement([2024, 2025, 2026])

  return {
    id,
    numeroInstrumento: faker.string.numeric(3).padStart(3, '0'),
    ano,
    numeroProcesso: `${faker.number.int({ min: 100, max: 999 })}/${ano}`,
    dataPublicacao: faker.date.recent().toISOString().split('T')[0],
    dataSessao: faker.date.future().toISOString().split('T')[0],
    dataAbertura: faker.date.future().toISOString().split('T')[0],
    dataHomologacao: faker.helpers.maybe(() => faker.date.future().toISOString().split('T')[0], { probability: 0.5 }),
    valorEstimado: faker.number.float({ min: 5000, max: 1000000, multipleOf: 0.02 }),
    valorAdjudicado: faker.helpers.maybe(() => faker.number.float({ min: 5000, max: 1000000, multipleOf: 0.02 }), { probability: 0.6 }),
    valorDotacao: faker.number.float({ min: 5000, max: 1500000, multipleOf: 0.02 }),
    tipoProcedimentoLicitacao: faker.helpers.enumValue(TipoProcedimentoLicitacao),
    status: faker.helpers.enumValue(StatusLicitacao),
    tipoCriterio: 'MENOR_PRECO',
    regimeExecucao: 'Empreitada por preço global',
    finalidade: faker.commerce.productName(),
    tipoResultado: 'ADJUDICADO',
    naturezaDespesa: 'Material Permanente',
    origemRecurso: faker.helpers.arrayElement(['Recursos Próprios', 'FUNDEB', 'Federal']),
    unidade: faker.company.name(),
    nomeAutoridade: faker.person.fullName(),
    sistemaEletronico: faker.helpers.arrayElement(['SICAF', 'COMPRASNET', 'BLL Compras']),
    lei: 'Lei 14.133/2021',
    covid: faker.datatype.boolean({ probability: 0.1 }),
    objeto: faker.lorem.paragraph(1),
    documentos: gerarDocumentos(3)
  }
}

const TOTAL_MOCK = 60
const licitacoes: LicitacaoCompleta[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarLicitacao(i + 1))

function paraResumo(licitacao: LicitacaoCompleta): LicitacaoResumo {
  return {
    id: licitacao.id,
    numeroInstrumento: licitacao.numeroInstrumento,
    ano: licitacao.ano,
    dataAbertura: licitacao.dataAbertura,
    tipo: licitacao.tipoProcedimentoLicitacao,
    statusDescricao: licitacao.status,
    valorTotalDespesa: licitacao.valorEstimado,
    unidade: licitacao.unidade,
    objeto: licitacao.objeto
  }
}

// Reaproveitado pelo mock de src/modules/contratos — contratos são um sub-recurso de licitação
export function buscarLicitacaoMockPorId(id: number): LicitacaoCompleta | undefined {
  return licitacoes.find(l => l.id === id)
}

export const licitacaoMock = {
  async listar(params: ListParams): Promise<Page<LicitacaoResumo>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = licitacoes

    if (filtros.numeroInstrumento) {
      dados = dados.filter(l => l.numeroInstrumento.includes(String(filtros.numeroInstrumento)))
    }
    if (filtros.numeroProcesso) {
      dados = dados.filter(l => l.numeroProcesso.includes(String(filtros.numeroProcesso)))
    }
    if (filtros.tipo) {
      dados = dados.filter(l => l.tipoProcedimentoLicitacao === filtros.tipo)
    }
    if (filtros.status) {
      dados = dados.filter(l => l.status === filtros.status)
    }
    if (filtros.nomeAutoridade) {
      dados = dados.filter(l => l.nomeAutoridade?.toLowerCase().includes(String(filtros.nomeAutoridade).toLowerCase()))
    }
    if (filtros.unidade) {
      dados = dados.filter(l => l.unidade?.toLowerCase().includes(String(filtros.unidade).toLowerCase()))
    }
    if (filtros.ano !== undefined) {
      dados = dados.filter(l => l.ano === Number(filtros.ano))
    }
    if (filtros.covid !== undefined) {
      dados = dados.filter(l => l.covid === Boolean(filtros.covid))
    }
    if (filtros.dataAberturaInicio) {
      const inicio = new Date(String(filtros.dataAberturaInicio)).getTime()
      dados = dados.filter(l => new Date(l.dataAbertura).getTime() >= inicio)
    }
    if (filtros.dataAberturaFim) {
      const fim = new Date(String(filtros.dataAberturaFim)).getTime()
      dados = dados.filter(l => new Date(l.dataAbertura).getTime() <= fim)
    }
    if (filtros.dataPublicacaoInicio) {
      const inicio = new Date(String(filtros.dataPublicacaoInicio)).getTime()
      dados = dados.filter(l => new Date(l.dataPublicacao).getTime() >= inicio)
    }
    if (filtros.dataPublicacaoFim) {
      const fim = new Date(String(filtros.dataPublicacaoFim)).getTime()
      dados = dados.filter(l => new Date(l.dataPublicacao).getTime() <= fim)
    }

    const ordenados = ordenar(dados as unknown as Record<string, unknown>[], sort) as unknown as LicitacaoCompleta[]

    return paginar(ordenados.map(paraResumo), page, size)
  },

  async buscarPorId(id: number): Promise<LicitacaoDetalhe> {
    const licitacao = buscarLicitacaoMockPorId(id)
    if (!licitacao) throw criarErroNaoEncontrado(`Licitação ${id} não encontrada (mock)`)

    return licitacao
  }
}
