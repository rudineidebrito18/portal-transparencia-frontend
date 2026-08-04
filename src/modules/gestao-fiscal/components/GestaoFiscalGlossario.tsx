import GlossarioTermos, { TermoGlossario } from '@/modules/shared/components/GlossarioTermos'

const TERMOS: TermoGlossario[] = [
  {
    sigla: 'RREO',
    titulo: 'Relatório Resumido da Execução Orçamentária',
    descricao: 'Mostra quanto o município previu e efetivamente recebeu de receitas, e quanto gastou — publicado bimestralmente, conforme exige a Lei de Responsabilidade Fiscal.'
  },
  {
    sigla: 'RGF',
    titulo: 'Relatório de Gestão Fiscal',
    descricao: 'Mostra os limites de gastos com pessoal, dívida e garantias que a Lei de Responsabilidade Fiscal impõe aos governos, e se o município está dentro deles.'
  },
  {
    sigla: 'Renúncia Fiscal',
    titulo: 'Renúncia de Receita',
    descricao: 'Valores que o município deixou de cobrar de impostos ou taxas por incentivo, isenção ou anistia fiscal concedida por lei.'
  },
  {
    sigla: 'Dívida Ativa',
    titulo: 'Empresas em Dívida Ativa',
    descricao: 'Lista de empresas ou pessoas que devem impostos ou taxas ao município e ainda não pagaram, mesmo após cobrança administrativa.'
  },
  {
    sigla: 'Inidôneas/Suspensas',
    titulo: 'Empresas Inidôneas ou Suspensas',
    descricao: 'Empresas impedidas de contratar com a administração pública por irregularidade comprovada em processo anterior.'
  }
]

export default function GestaoFiscalGlossario() {
  return <GlossarioTermos termos={TERMOS} />
}
