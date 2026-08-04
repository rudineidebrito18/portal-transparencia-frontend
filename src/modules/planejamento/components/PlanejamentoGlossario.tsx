import GlossarioTermos, { TermoGlossario } from '@/modules/shared/components/GlossarioTermos'

const TERMOS: TermoGlossario[] = [
  {
    sigla: 'PPA',
    titulo: 'Plano Plurianual',
    descricao: 'Planeja as grandes prioridades e investimentos do município para um período de 4 anos.'
  },
  {
    sigla: 'LDO',
    titulo: 'Lei de Diretrizes Orçamentárias',
    descricao: 'Define as metas e prioridades que vão orientar a elaboração do orçamento do ano seguinte.'
  },
  {
    sigla: 'LOA',
    titulo: 'Lei Orçamentária Anual',
    descricao: 'É o orçamento propriamente dito: detalha quanto será gasto e de onde virá o dinheiro em cada área, ano a ano.'
  },
  {
    sigla: 'Plano Estratégico',
    titulo: 'Plano Estratégico Institucional',
    descricao: 'Define a visão de longo prazo, a missão e os objetivos estratégicos da gestão municipal.'
  },
  {
    sigla: 'RGA',
    titulo: 'Relatório de Gestão e Atividades',
    descricao: 'Presta contas do que foi efetivamente realizado em relação ao que havia sido planejado.'
  }
]

export default function PlanejamentoGlossario() {
  return <GlossarioTermos termos={TERMOS} />
}
