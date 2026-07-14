import { fakerPT_BR as faker } from '@faker-js/faker'

import { buscarLicitacaoMockPorId, listarTodasLicitacoesMock, LicitacaoCompleta } from '@/modules/licitacoes/mocks/licitacao.mock'
import { criarErroNaoEncontrado, ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Documento } from '@/modules/shared/types/Documento'
import { Page } from '@/modules/shared/types/Page'
import { Aditivo, ContratoLicitacao } from '../types'

function gerarContratosDaLicitacao(licitacao: LicitacaoCompleta): ContratoLicitacao[] {
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

function gerarDocumentosDoContrato(contratoId: number): Documento[] {
  faker.seed(contratoId + 20_000)

  const tipos = ['Termo de Contrato', 'Ata de Registro de Preços', 'Nota de Empenho']
  const quantidade = faker.number.int({ min: 1, max: 3 })

  return Array.from({ length: quantidade }, (_, i) => ({
    id: contratoId * 10 + i,
    assunto: faker.lorem.sentence(4),
    tipoDocumento: faker.helpers.arrayElement(tipos),
    dataEnvio: faker.date.past().toISOString().split('T')[0],
    caminhoPdf: `/documentos/contratos/${contratoId}/documento_${i + 1}.pdf`
  }))
}

function gerarAditivosDoContrato(contratoId: number): Aditivo[] {
  faker.seed(contratoId + 30_000)

  const quantidade = faker.helpers.maybe(() => faker.number.int({ min: 1, max: 2 }), { probability: 0.3 }) ?? 0

  return Array.from({ length: quantidade }, (_, i) => ({
    id: contratoId * 10 + i,
    dataAssinatura: faker.date.past().toISOString().split('T')[0],
    objeto: 'Termo aditivo de acréscimo de valor e prorrogação de prazo.',
    fornecedorNome: faker.company.name().toUpperCase(),
    fornecedorCnpj: faker.string.numeric(14),
    caminhoPdf: `/documentos/contratos/${contratoId}/aditivo_${i + 1}.pdf`,
    contratoLicitacaoId: contratoId
  }))
}

export const contratoMock = {
  async buscarPorId(id: number): Promise<ContratoLicitacao> {
    const licitacaoId = Math.floor(id / 100)
    const licitacao = buscarLicitacaoMockPorId(licitacaoId)
    if (!licitacao) throw criarErroNaoEncontrado(`Contrato ${id} não encontrado (mock)`)

    const contrato = gerarContratosDaLicitacao(licitacao).find(c => c.id === id)
    if (!contrato) throw criarErroNaoEncontrado(`Contrato ${id} não encontrado (mock)`)

    return contrato
  },

  async listarPorLicitacao(
    licitacaoId: number,
    params: { page?: number; size?: number; sort?: string }
  ): Promise<Page<ContratoLicitacao>> {
    const licitacao = buscarLicitacaoMockPorId(licitacaoId)
    if (!licitacao) throw criarErroNaoEncontrado(`Licitação ${licitacaoId} não encontrada (mock)`)

    const { page = 0, size = 10, sort } = params
    const contratos = ordenar(
      gerarContratosDaLicitacao(licitacao) as unknown as Record<string, unknown>[],
      sort
    ) as unknown as ContratoLicitacao[]

    return paginar(contratos, page, size)
  },

  async listarTodos(
    params: { page?: number; size?: number; sort?: string }
  ): Promise<Page<ContratoLicitacao>> {
    const { page = 0, size = 10, sort } = params

    const todosContratos = listarTodasLicitacoesMock().flatMap(gerarContratosDaLicitacao)
    const ordenados = ordenar(
      todosContratos as unknown as Record<string, unknown>[],
      sort ?? 'dataPublicacao,desc'
    ) as unknown as ContratoLicitacao[]

    return paginar(ordenados, page, size)
  },

  async listarDocumentos(contratoId: number): Promise<Documento[]> {
    return gerarDocumentosDoContrato(contratoId)
  },

  async listarAditivos(contratoId: number): Promise<Aditivo[]> {
    return gerarAditivosDoContrato(contratoId)
  }
}
