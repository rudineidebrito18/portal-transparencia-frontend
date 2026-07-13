import { fakerPT_BR as faker } from '@faker-js/faker'

import { criarErroNaoEncontrado, ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { FiltroServidor, Servidor, Unidade } from '../types'

type ListParams = FiltroServidor & {
  page?: number
  size?: number
  sort?: string
}

const UNIDADES: Unidade[] = [
  { id: 1, nome: 'Secretaria de Administração' },
  { id: 2, nome: 'Secretaria de Saúde' },
  { id: 3, nome: 'Secretaria de Educação' },
  { id: 4, nome: 'Secretaria de Obras' },
  { id: 5, nome: 'Secretaria de Finanças' },
  { id: 6, nome: 'Gabinete do Prefeito' }
]

const CARGOS = [
  'Professor',
  'Enfermeiro',
  'Agente Administrativo',
  'Motorista',
  'Auxiliar de Serviços Gerais',
  'Assistente Social',
  'Fiscal de Obras',
  'Contador',
  'Procurador Municipal',
  'Médico'
]

function gerarCpf(): string {
  const n = () => faker.string.numeric(3)
  const d = () => faker.string.numeric(2)
  return `${n()}.${n()}.${n()}-${d()}`
}

function gerarServidor(id: number): Servidor {
  faker.seed(id)

  return {
    id,
    cpf: gerarCpf(),
    name: faker.person.fullName(),
    cargo: faker.helpers.arrayElement(CARGOS),
    unidade: faker.helpers.arrayElement(UNIDADES),
    dataAdmissao: faker.date.between({ from: '2010-01-01', to: '2024-12-31' }).toISOString().split('T')[0],
    cargaHoraria: faker.helpers.arrayElement([20, 30, 40, 44])
  }
}

const TOTAL_MOCK = 85
const servidores: Servidor[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarServidor(i + 1))

export function buscarServidorMockPorId(id: number): Servidor | undefined {
  return servidores.find(s => s.id === id)
}

export const servidorMock = {
  async listar(params: ListParams): Promise<Page<Servidor>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = servidores

    if (filtros.name) {
      dados = dados.filter(s => s.name.toLowerCase().includes(String(filtros.name).toLowerCase()))
    }
    if (filtros.cpf) {
      dados = dados.filter(s => s.cpf.includes(String(filtros.cpf)))
    }
    if (filtros.cargo) {
      dados = dados.filter(s => s.cargo.toLowerCase().includes(String(filtros.cargo).toLowerCase()))
    }
    if (filtros.unidadeId !== undefined) {
      dados = dados.filter(s => s.unidade?.id === Number(filtros.unidadeId))
    }
    if (filtros.cargaHoraria !== undefined) {
      dados = dados.filter(s => s.cargaHoraria === Number(filtros.cargaHoraria))
    }
    if (filtros.dataAdmissaoInicio) {
      const inicio = new Date(String(filtros.dataAdmissaoInicio)).getTime()
      dados = dados.filter(s => new Date(s.dataAdmissao).getTime() >= inicio)
    }
    if (filtros.dataAdmissaoFim) {
      const fim = new Date(String(filtros.dataAdmissaoFim)).getTime()
      dados = dados.filter(s => new Date(s.dataAdmissao).getTime() <= fim)
    }

    const ordenados = ordenar(dados as unknown as Record<string, unknown>[], sort) as unknown as Servidor[]

    return paginar(ordenados, page, size)
  },

  async buscarPorId(id: number): Promise<Servidor> {
    const servidor = buscarServidorMockPorId(id)
    if (!servidor) throw criarErroNaoEncontrado(`Servidor ${id} não encontrado (mock)`)

    return servidor
  }
}
