import { fakerPT_BR as faker } from '@faker-js/faker'

import { Cargo } from '../types'

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
  async listar(): Promise<Cargo[]> {
    return CARGOS
  }
}
