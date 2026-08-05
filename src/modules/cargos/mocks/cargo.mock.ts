import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { Cargo, FiltroCargo } from '../types'

type ListarParams = FiltroCargo & {
  page?: number
  size?: number
  sort?: string
}

const NOMES_CARGO = [
  'Professor',
  'Enfermeiro',
  'Médico',
  'Auxiliar Administrativo',
  'Motorista',
  'Agente Comunitário de Saúde',
  'Procurador Municipal',
  'Contador',
  'Fiscal de Tributos',
  'Assistente Social',
  'Técnico de Enfermagem',
  'Merendeira',
  'Zelador',
  'Engenheiro Civil',
  'Psicólogo'
]

function gerarCargo(id: number, nomeCargo: string): Cargo {
  faker.seed(id + 70_000)

  const quantidade = faker.number.int({ min: 2, max: 60 })
  const valorBrutoUnitario = faker.number.float({ min: 1800, max: 12000, multipleOf: 0.01 })
  const valorBruto = Number((valorBrutoUnitario * quantidade).toFixed(2))
  const valorDesconto = Number((valorBruto * faker.number.float({ min: 0.08, max: 0.18 })).toFixed(2))
  const valorLiquido = Number((valorBruto - valorDesconto).toFixed(2))
  const media = Number((valorBruto / quantidade).toFixed(2))

  return {
    id,
    cargo: nomeCargo,
    quantidade,
    valorBruto,
    valorDesconto,
    valorLiquido,
    media
  }
}

const CARGOS = NOMES_CARGO.map((nome, i) => gerarCargo(i + 1, nome))

export const cargoMock = {
  async listar(params: ListarParams): Promise<Page<Cargo>> {
    const { page = 0, size = 10, sort, ...filtros } = params

    let dados = CARGOS

    if (filtros.cargo) {
      dados = dados.filter(c => c.cargo.toLowerCase().includes(String(filtros.cargo).toLowerCase()))
    }
    if (filtros.valorBrutoMin !== undefined) {
      dados = dados.filter(c => c.valorBruto >= Number(filtros.valorBrutoMin))
    }
    if (filtros.valorBrutoMax !== undefined) {
      dados = dados.filter(c => c.valorBruto <= Number(filtros.valorBrutoMax))
    }

    const ordenados = ordenar(dados as unknown as Record<string, unknown>[], sort) as unknown as Cargo[]

    return paginar(ordenados, page, size)
  }
}
