import { fakerPT_BR as faker } from '@faker-js/faker'

import { ObraPublica, StatusObra, TipoObra } from '../types'

const OBJETOS = [
  'Pavimentação asfáltica de vias urbanas',
  'Construção de unidade básica de saúde',
  'Reforma da escola municipal',
  'Implantação de rede de drenagem pluvial',
  'Construção de ponte sobre o rio',
  'Reforma da praça central',
  'Ampliação do prédio da prefeitura',
  'Construção de creche municipal'
]

function gerarObra(id: number): ObraPublica {
  faker.seed(id + 600)

  const status = faker.helpers.arrayElement(Object.values(StatusObra))
  const paralisada = status === StatusObra.EM_ANDAMENTO && faker.datatype.boolean({ probability: 0.25 })

  const dataInicio = faker.date.between({ from: '2022-01-01', to: '2024-06-30' })
  const dataPrevistaTermino = faker.date.soon({ days: 400, refDate: dataInicio })
  const dataTermino = status === StatusObra.CONCLUIDA
    ? faker.date.between({ from: dataInicio, to: dataPrevistaTermino })
    : undefined

  const valorTotal = faker.number.float({ min: 80_000, max: 3_500_000, multipleOf: 0.01 })
  const percentualObra = status === StatusObra.CONCLUIDA
    ? 100
    : faker.number.float({ min: 5, max: 95, multipleOf: 0.1 })
  const percentualFinanceiro = Math.max(0, percentualObra - faker.number.float({ min: 0, max: 10, multipleOf: 0.1 }))

  const totalObra = valorTotal
  const totalMedicao = Number((totalObra * (percentualFinanceiro / 100)).toFixed(2))
  const totalMedicaoPaga = Number((totalMedicao * 0.9).toFixed(2))

  return {
    id,
    numero: 1000 + id,
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataPrevistaTermino: dataPrevistaTermino.toISOString().split('T')[0],
    dataTermino: dataTermino?.toISOString().split('T')[0],
    ultimaAtualizacao: faker.date.recent({ days: 30 }).toISOString(),
    valorTotal,
    tipo: faker.helpers.arrayElement(Object.values(TipoObra)),
    status,
    paralisada,
    fonte: faker.helpers.arrayElement(['Recursos Próprios', 'Convênio Federal', 'Convênio Estadual', 'Financiamento']),
    local: `${faker.location.street()}, ${faker.location.city()}`,
    objeto: faker.helpers.arrayElement(OBJETOS),
    unidadeId: faker.number.int({ min: 1, max: 5 }),
    nomeUnidade: faker.helpers.arrayElement(['Secretaria de Obras', 'Secretaria de Infraestrutura', 'Secretaria de Educação']),
    fornecedorId: faker.number.int({ min: 1, max: 30 }),
    nomeFornecedor: `${faker.company.name()} LTDA`,
    totalObra,
    totalMedicao,
    totalMedicaoPaga,
    saldoObra: Number((totalObra - totalMedicao).toFixed(2)),
    saldoConta: Number((totalMedicao - totalMedicaoPaga).toFixed(2)),
    percentualObra,
    percentualFinanceiro
  }
}

const OBRAS = Array.from({ length: 18 }, (_, i) => gerarObra(i + 1))

export const obraMock = {
  async listar(): Promise<ObraPublica[]> {
    return OBRAS
  }
}
