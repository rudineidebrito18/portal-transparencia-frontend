import { fakerPT_BR as faker } from '@faker-js/faker'

import { criarErroNaoEncontrado } from '@/modules/shared/mocks/mockUtils'
import { AnexoConcurso, Concurso } from '../types'

const RESUMOS = [
  'Concurso público para provimento de vagas no quadro efetivo da Prefeitura.',
  'Processo seletivo simplificado para contratação temporária.',
  'Concurso público para cargos de nível superior e médio.'
]

function gerarConcurso(id: number): Concurso {
  faker.seed(id + 50_000)

  const ano = faker.helpers.arrayElement([2023, 2024, 2025, 2026])
  const dataAbertura = faker.date.between({ from: `${ano}-01-01`, to: `${ano}-06-30` })
  const dataInscricoes = faker.date.soon({ days: 10, refDate: dataAbertura })
  const dataTerminoInscricoes = faker.date.soon({ days: 30, refDate: dataInscricoes })
  const validate = faker.date.soon({ days: 730, refDate: dataTerminoInscricoes })

  return {
    id,
    descricao: `Concurso Público Nº ${String(id).padStart(3, '0')}/${ano}`,
    numero: id,
    ano,
    dataAbertura: dataAbertura.toISOString().split('T')[0],
    dataInscricoes: dataInscricoes.toISOString().split('T')[0],
    dataTerminoInscricoes: dataTerminoInscricoes.toISOString().split('T')[0],
    validate: validate.toISOString().split('T')[0],
    resumo: faker.helpers.arrayElement(RESUMOS)
  }
}

function gerarAnexos(concursoId: number): AnexoConcurso[] {
  faker.seed(concursoId + 60_000)

  const tipos = ['Edital de Abertura', 'Edital de Homologação', 'Gabarito Preliminar', 'Resultado Final']
  const quantidade = faker.number.int({ min: 1, max: 4 })

  return Array.from({ length: quantidade }, (_, i) => ({
    id: concursoId * 10 + i,
    descricao: tipos[i] ?? `Anexo ${i + 1}`,
    data: faker.date.recent({ days: 200 }).toISOString().split('T')[0],
    caminhoArquivo: `/uploads/concursos/${concursoId}/anexo_${i + 1}.pdf`
  }))
}

const CONCURSOS = Array.from({ length: 12 }, (_, i) => gerarConcurso(i + 1))

export const concursoMock = {
  async listar(): Promise<Concurso[]> {
    return CONCURSOS
  },

  async listarAnexos(concursoId: number): Promise<AnexoConcurso[]> {
    if (!CONCURSOS.some(c => c.id === concursoId)) {
      throw criarErroNaoEncontrado(`Concurso ${concursoId} não encontrado (mock)`)
    }

    return gerarAnexos(concursoId)
  }
}
