import { fakerPT_BR as faker } from '@faker-js/faker'

import { ordenar, paginar } from '@/modules/shared/mocks/mockUtils'
import { Page } from '@/modules/shared/types/Page'
import { ConteudoInstitucional, RecursoInstitucional } from '../types'

type ListParams = {
  ativo?: boolean
  page?: number
  size?: number
  sort?: string
}

const TITULOS_NOTICIA = [
  'Prefeitura inaugura nova unidade de saúde',
  'Matrículas para creches municipais estão abertas',
  'Obras de pavimentação avançam no bairro Centro',
  'Município recebe recursos para infraestrutura',
  'Campanha de vacinação segue até o fim do mês'
]

const TITULOS_AVISO = [
  'Ponto facultativo na próxima segunda-feira',
  'Manutenção programada no sistema de água',
  'Alteração no horário de atendimento da Secretaria',
  'Prazo para regularização de tributos se encerra em breve',
  'Interdição temporária de via para obras'
]

function gerarItem(recurso: RecursoInstitucional, id: number): ConteudoInstitucional {
  faker.seed(id + (recurso === 'avisos' ? 50_000 : 0))

  const titulos = recurso === 'noticias' ? TITULOS_NOTICIA : TITULOS_AVISO

  return {
    id,
    titulo: faker.helpers.arrayElement(titulos),
    texto: faker.lorem.paragraphs(2, '\n\n'),
    data: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
    ativo: faker.datatype.boolean({ probability: 0.85 })
  }
}

const TOTAL_MOCK = 24
const dados: Record<RecursoInstitucional, ConteudoInstitucional[]> = {
  noticias: Array.from({ length: TOTAL_MOCK }, (_, i) => gerarItem('noticias', i + 1)),
  avisos: Array.from({ length: TOTAL_MOCK }, (_, i) => gerarItem('avisos', i + 1))
}

export const institucionalMock = {
  async listar(recurso: RecursoInstitucional, params: ListParams): Promise<Page<ConteudoInstitucional>> {
    const { page = 0, size = 10, sort, ativo } = params

    let itens = dados[recurso]

    if (ativo !== undefined) {
      itens = itens.filter(item => item.ativo === ativo)
    }

    const ordenados = ordenar(itens as unknown as Record<string, unknown>[], sort) as unknown as ConteudoInstitucional[]

    return paginar(ordenados, page, size)
  }
}
