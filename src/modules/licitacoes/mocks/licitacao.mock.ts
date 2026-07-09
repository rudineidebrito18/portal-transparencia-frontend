import { fakerPT_BR as faker } from '@faker-js/faker'

import { Page } from '@/modules/shared/types/Page'
import { ContratoLicitacao } from '../contrato.types'
import { StatusLicitacao, TipoProcedimentoLicitacao } from '../enums'
import { DocumentoLicitacao, FiltroLicitacao, LicitacaoDetalhe, LicitacaoResumo } from '../types'

interface LicitacaoCompleta extends LicitacaoDetalhe {
  id: number
}

type ListParams = FiltroLicitacao & {
  page?: number
  size?: number
  sort?: string
}

function criarErroNaoEncontrado(mensagem: string) {
  const erro = new Error(mensagem) as Error & { status?: number }
  erro.status = 404
  return erro
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

function gerarContratos(licitacao: LicitacaoCompleta): ContratoLicitacao[] {
  faker.seed(licitacao.id + 10_000)

  const quantidade = faker.number.int({ min: 0, max: 3 })

  return Array.from({ length: quantidade }, (_, i) => {
    const dataAssinatura = faker.date.past()
    const dataInicio = new Date(dataAssinatura)
    dataInicio.setDate(dataInicio.getDate() + 5)
    const dataTermino = new Date(dataInicio)
    dataTermino.setFullYear(dataTermino.getFullYear() + 1)

    return {
      id: licitacao.id * 100 + i,
      numeroContrato: faker.number.int({ min: 1, max: 500 }),
      exercicio: licitacao.ano,
      fornecedor: faker.company.name().toUpperCase(),
      dataAssinatura: dataAssinatura.toISOString().split('T')[0],
      dataPublicacao: dataAssinatura.toISOString().split('T')[0],
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataTermino: dataTermino.toISOString().split('T')[0],
      unidade: licitacao.unidade ?? '',
      gestorContrato: faker.person.fullName().toUpperCase(),
      meioPublicacao: 'DIÁRIO OFICIAL DO MUNICÍPIO',
      valorContrato: Number(faker.commerce.price({ min: 10000, max: 1000000 })),
      status: faker.helpers.arrayElement(['EM_ANDAMENTO', 'CONCLUIDO', 'RESCINDIDO', 'SUSPENSO']),
      objeto: licitacao.objeto,
      numeroLicitacao: `${licitacao.numeroInstrumento}/${licitacao.ano}`
    }
  })
}

function ordenar<T extends Record<string, unknown>>(dados: T[], sort?: string): T[] {
  if (!sort) return dados

  const [campo, direcao] = sort.split(',')
  if (!campo) return dados

  return [...dados].sort((a, b) => {
    const valorA = a[campo] ?? ''
    const valorB = b[campo] ?? ''

    if (valorA < valorB) return direcao === 'desc' ? 1 : -1
    if (valorA > valorB) return direcao === 'desc' ? -1 : 1
    return 0
  })
}

function paginar<T>(dados: T[], page = 0, size = 10): Page<T> {
  const start = page * size
  const end = start + size

  return {
    content: dados.slice(start, end),
    totalPages: Math.ceil(dados.length / size) || 0,
    totalElements: dados.length,
    number: page,
    size
  }
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
    const licitacao = licitacoes.find(l => l.id === id)
    if (!licitacao) throw criarErroNaoEncontrado(`Licitação ${id} não encontrada (mock)`)

    return licitacao
  },

  async listarContratos(
    licitacaoId: number,
    params: { page?: number; size?: number; sort?: string }
  ): Promise<Page<ContratoLicitacao>> {
    const licitacao = licitacoes.find(l => l.id === licitacaoId)
    if (!licitacao) throw criarErroNaoEncontrado(`Licitação ${licitacaoId} não encontrada (mock)`)

    const { page = 0, size = 10, sort } = params
    const contratos = ordenar(gerarContratos(licitacao) as unknown as Record<string, unknown>[], sort) as unknown as ContratoLicitacao[]

    return paginar(contratos, page, size)
  }
}
