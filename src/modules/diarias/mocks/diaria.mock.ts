import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { Diaria, FiltroDiaria } from '../types'

type ListParams = FiltroDiaria & {
  page?: number
  size?: number
  sort?: string
}

const CARGOS = ['Prefeito', 'Secretário Municipal', 'Assessor', 'Motorista', 'Fiscal de Obras']
const DESTINOS = ['São Luís - MA', 'Brasília - DF', 'Imperatriz - MA', 'Teresina - PI', 'Fortaleza - CE']
const MOTIVOS = [
  'Participação em reunião com órgão estadual',
  'Capacitação técnica',
  'Audiência pública em órgão federal',
  'Assinatura de convênio',
  'Fiscalização de obra'
]

function gerarDiaria(id: number): Diaria {
  faker.seed(id + 800)

  const dataInicio = faker.date.between({ from: '2022-01-01', to: '2025-06-30' })
  const quantDiarias = faker.number.int({ min: 1, max: 5 })
  const dataTermino = new Date(dataInicio)
  dataTermino.setDate(dataTermino.getDate() + quantDiarias)

  return {
    id,
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataTermino: dataTermino.toISOString().split('T')[0],
    beneficiario: faker.person.fullName(),
    cargo: faker.helpers.arrayElement(CARGOS),
    destino: faker.helpers.arrayElement(DESTINOS),
    motivo: faker.helpers.arrayElement(MOTIVOS),
    quantDiarias,
    valorConcedido: faker.number.float({ min: 200, max: 3500, multipleOf: 0.01 })
  }
}

const TOTAL_MOCK = 40
const diarias: Diaria[] = Array.from({ length: TOTAL_MOCK }, (_, i) => gerarDiaria(i + 1))

export const diariaMock = {
  async listar(params: ListParams): Promise<Page<Diaria>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = diarias

    if (filtros.beneficiario) {
      dados = dados.filter(d => d.beneficiario.toLowerCase().includes(String(filtros.beneficiario).toLowerCase()))
    }
    if (filtros.cargo) {
      dados = dados.filter(d => d.cargo.toLowerCase().includes(String(filtros.cargo).toLowerCase()))
    }
    if (filtros.destino) {
      dados = dados.filter(d => d.destino.toLowerCase().includes(String(filtros.destino).toLowerCase()))
    }
    if (filtros.motivo) {
      dados = dados.filter(d => d.motivo.toLowerCase().includes(String(filtros.motivo).toLowerCase()))
    }
    if (filtros.quantDiarias !== undefined) {
      dados = dados.filter(d => d.quantDiarias === Number(filtros.quantDiarias))
    }
    if (filtros.dataInicio) {
      const inicio = new Date(String(filtros.dataInicio)).getTime()
      dados = dados.filter(d => new Date(d.dataInicio).getTime() >= inicio)
    }
    if (filtros.dataTermino) {
      const fim = new Date(String(filtros.dataTermino)).getTime()
      dados = dados.filter(d => new Date(d.dataTermino).getTime() <= fim)
    }

    const ordenados = ordenar(dados as unknown as Record<string, unknown>[], sort) as unknown as Diaria[]

    return paginar(ordenados, page, size)
  }
}
