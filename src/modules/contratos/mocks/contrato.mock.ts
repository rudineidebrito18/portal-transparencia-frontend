import { fakerPT_BR as faker } from '@faker-js/faker'

import { buscarLicitacaoMockPorId, listarTodasLicitacoesMock, LicitacaoCompleta } from '@/modules/licitacoes/mocks/licitacao.mock'
import { criarErroNaoEncontrado, ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Documento } from '@/modules/shared/types/Documento'
import { Page } from '@/modules/shared/types/Page'
import { Aditivo, ContratoLicitacao, FiltroContrato } from '../types'

interface ContratoMockGerado extends ContratoLicitacao {
  unidadeId?: number
}

function gerarContratosDaLicitacao(licitacao: LicitacaoCompleta): ContratoMockGerado[] {
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
      numeroLicitacao: `${licitacao.numeroInstrumento}/${licitacao.ano}`,
      unidadeId: licitacao.unidadeId
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
    params: FiltroContrato & { page?: number; size?: number; sort?: string }
  ): Promise<Page<ContratoLicitacao>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = listarTodasLicitacoesMock().flatMap(gerarContratosDaLicitacao)

    if (filtros.numeroContrato !== undefined) {
      dados = dados.filter(c => c.numeroContrato === Number(filtros.numeroContrato))
    }
    if (filtros.exercicio !== undefined) {
      dados = dados.filter(c => c.exercicio === Number(filtros.exercicio))
    }
    if (filtros.fornecedor) {
      dados = dados.filter(c => c.fornecedor.toLowerCase().includes(String(filtros.fornecedor).toLowerCase()))
    }
    if (filtros.objeto) {
      dados = dados.filter(c => c.objeto.toLowerCase().includes(String(filtros.objeto).toLowerCase()))
    }
    if (filtros.status) {
      dados = dados.filter(c => c.status === filtros.status)
    }
    if (filtros.gestorContrato) {
      dados = dados.filter(c => c.gestorContrato.toLowerCase().includes(String(filtros.gestorContrato).toLowerCase()))
    }
    if (filtros.unidadeId !== undefined) {
      dados = dados.filter(c => c.unidadeId === Number(filtros.unidadeId))
    }
    if (filtros.dataInicial) {
      const inicio = new Date(String(filtros.dataInicial)).getTime()
      dados = dados.filter(c => new Date(c.dataAssinatura).getTime() >= inicio)
    }
    if (filtros.dataFinal) {
      const fim = new Date(String(filtros.dataFinal)).getTime()
      dados = dados.filter(c => new Date(c.dataAssinatura).getTime() <= fim)
    }

    const ordenados = ordenar(
      dados as unknown as Record<string, unknown>[],
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
