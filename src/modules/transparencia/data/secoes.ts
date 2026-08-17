import {
  MdAccountBalance,
  MdAttachMoney,
  MdSwapHoriz,
  MdGroups,
  MdFlightTakeoff,
  MdGavel,
  MdConstruction,
  MdAssessment,
  MdRecordVoiceOver,
  MdSecurity,
  MdReceiptLong,
  MdLocalHospital,
  MdSchool,
  MdAccountTree,
  MdHub,
  MdArticle,
  MdHelpOutline,
  MdArchive,
  MdTrendingUp,
  MdTrendingDown,
  MdMoneyOff,
  MdCallReceived,
  MdCallMade,
  MdHandshake,
  MdBadge,
  MdPayments,
  MdTableChart,
  MdWorkOutline,
  MdBusinessCenter,
  MdAssignmentInd,
  MdMenuBook,
  MdListAlt,
  MdBlock,
  MdDescription,
  MdFactCheck,
  MdPauseCircleOutline,
  MdInsertChart,
  MdBalance,
  MdHowToVote,
  MdBarChart,
  MdPieChart,
  MdDateRange,
  MdFlag,
  MdRule,
  MdRequestQuote,
  MdMailOutline,
  MdPolicy,
  MdSupportAgent,
  MdContactMail,
  MdPublic,
  MdPercent,
  MdEditNote,
  MdHealthAndSafety,
  MdLocationOn,
  MdLocalPharmacy,
  MdGroup,
  MdVolunteerActivism,
  MdPeopleAlt,
  MdAssignment,
  MdNewspaper,
  MdCoronavirus,
  MdReportProblem,
} from 'react-icons/md'
import { IconType } from 'react-icons'

export interface ItemAcesso {
  label: string
  icon: IconType
  href?: string
}

// Cores já existentes em globals.css (@theme) — nada de tom novo, só reaproveita a
// paleta da marca pra dar identidade visual a cada seção (ajuda a escanear as 14
// seções da página). Ver mapeamento em CORES_SECAO (SecaoAcesso.tsx).
export type CorSecao = 'primary' | 'accent' | 'secondary' | 'primary-light' | 'accent-dark' | 'accent-light' | 'primary-dark' | 'tertiary'

export interface SecaoAcesso {
  titulo: string
  icon: IconType
  cor: CorSecao
  itens: ItemAcesso[]
}

// Espelha 1:1 o checklist de funcionalidades do portal legado (mesmas 14 seções, mesma
// ordem, mesmos rótulos) — usado pelo usuário pra conferir item por item contra o site
// antigo. Itens sem `href` são gaps reais (ainda não implementados).
export const secoesAcessoInformacao: SecaoAcesso[] = [
  {
    titulo: 'Informações Institucionais',
    icon: MdAccountBalance,
    cor: 'primary',
    itens: [
      { label: 'Diário Oficial', icon: MdNewspaper, href: '/diario-oficial' },
      { label: 'Leis', icon: MdArticle, href: '/legislacao' },
      { label: 'Estrutura Administrativa do Município', icon: MdAccountTree, href: '/estrutura-organizacional' },
      { label: 'Organograma', icon: MdHub, href: '/organograma' },
    ],
  },
  {
    titulo: 'Execução Orçamentária e Financeira',
    icon: MdAttachMoney,
    cor: 'accent',
    itens: [
      { label: 'Execução Orçamentária 2018 a 2024', icon: MdTrendingUp, href: '/execucao-orcamentaria/2018-2024' },
      { label: 'Execução Orçamentária (2025-2026)', icon: MdTrendingDown, href: '/execucao-orcamentaria/2025-2026' },
      { label: 'Empresas com Dívida Ativa', icon: MdMoneyOff, href: '/divida-ativa' },
    ],
  },
  {
    titulo: 'Convênios e Transferências',
    icon: MdSwapHoriz,
    cor: 'secondary',
    itens: [
      { label: 'Convênios e Transferências Recebidas', icon: MdCallReceived, href: '/convenios?categoria=transferencias-recebidas' },
      { label: 'Convênios e Transferências Realizadas', icon: MdCallMade, href: '/convenios?categoria=transferencias-realizadas' },
      { label: 'Acordos Firmados pelo Órgão', icon: MdHandshake, href: '/convenios?categoria=acordos-firmados' },
    ],
  },
  {
    titulo: 'Recursos Humanos',
    icon: MdGroups,
    cor: 'primary-light',
    itens: [
      { label: 'Folha de Pagamento', icon: MdPayments, href: '/folha-pagamento' },
      { label: 'Servidores', icon: MdBadge, href: '/servidores' },
      { label: 'Cargos', icon: MdTableChart, href: '/cargos' },
      { label: 'Concursos', icon: MdAssignmentInd, href: '/concursos' },
      { label: 'Estagiários', icon: MdWorkOutline, href: '/estagiarios' },
      { label: 'Terceirizados', icon: MdBusinessCenter, href: '/terceirizados' },
    ],
  },
  {
    titulo: 'Diárias',
    icon: MdFlightTakeoff,
    cor: 'accent-dark',
    itens: [
      { label: 'Diárias', icon: MdFlightTakeoff, href: '/diarias' },
      { label: 'Tabelas de Valores da Diária', icon: MdListAlt, href: '/tabela-valores' },
    ],
  },
  {
    titulo: 'Licitações e Contratos',
    icon: MdGavel,
    cor: 'accent-light',
    itens: [
      { label: 'Licitações', icon: MdGavel, href: '/licitacoes' },
      { label: 'Contratos', icon: MdDescription, href: '/contratos' },
      { label: 'Aditivos de Contratos', icon: MdAssignment, href: '/aditivos-contratos' },
      { label: 'Fiscal de Contratos (Ato Normativo)', icon: MdFactCheck, href: '/fiscal-contrato' },
      { label: 'Lista de Fiscais de Contrato', icon: MdBadge, href: '/fiscais-contratos' },
      { label: 'Licitantes Sancionados', icon: MdReportProblem, href: '/licitantes-sancionados' },
      { label: 'Relação de Licitantes Contratados', icon: MdListAlt, href: '/licitantes-contratados' },
      { label: 'Empresas Inidôneas e Suspensas', icon: MdBlock, href: '/empresas-inidoneas' },
      { label: 'Licitações COVID-19', icon: MdCoronavirus, href: '/licitacoes?covid=true' },
    ],
  },
  {
    titulo: 'Obras Públicas',
    icon: MdConstruction,
    // Único uso do verde de marca (`tertiary`) nesta rodada — Obras Públicas era o
    // candidato mais natural (infraestrutura/cidade em construção), evita reassinar as
    // outras 11 seções sem uma decisão de conteúdo caso a caso.
    cor: 'tertiary',
    itens: [
      { label: 'Obras Públicas', icon: MdConstruction, href: '/obras' },
      // O filtro de paralisada no backend é o booleano ?paralisada=true — "status=paralisadas"
      // não existe no enum StatusObra (400) e quebrava a página ao abrir por este link.
      { label: 'Obras Paralisadas', icon: MdPauseCircleOutline, href: '/obras?paralisada=true' },
    ],
  },
  {
    titulo: 'Planejamento e Prestação de Contas',
    icon: MdAssessment,
    cor: 'primary',
    itens: [
      { label: 'Prestação de Contas — Anos Anteriores', icon: MdArchive, href: '/prestacao-contas-anos-anteriores' },
      { label: 'Relatório de Gestão ou Atividade (RGA)', icon: MdInsertChart, href: '/rga' },
      { label: 'Julgamento de Contas pelo TCE', icon: MdBalance, href: '/julgamento-contas-tce' },
      { label: 'Julgamento de Contas (Legislativo)', icon: MdHowToVote, href: '/julgamento-contas-legislativo' },
      { label: 'Relatório de Gestão Fiscal (RGF)', icon: MdBarChart, href: '/rgf' },
      { label: 'Relatório Resumido da Execução Orçamentária (RREO)', icon: MdPieChart, href: '/rreo' },
      { label: 'Plano Estratégico Institucional (PEI)', icon: MdFlag, href: '/plano-estrategico' },
      { label: 'Plano Plurianual (PPA)', icon: MdDateRange, href: '/ppa' },
      { label: 'Lei de Diretrizes Orçamentárias (LDO)', icon: MdRule, href: '/ldo' },
      { label: 'Lei Orçamentária Anual (LOA)', icon: MdRequestQuote, href: '/loa' },
    ],
  },
  {
    titulo: 'Ouvidoria e E-SIC',
    icon: MdRecordVoiceOver,
    cor: 'accent',
    itens: [
      { label: 'E-SIC', icon: MdMailOutline, href: '/esic' },
      { label: 'Ouvidoria', icon: MdSupportAgent, href: '/ouvidoria' },
      { label: 'Formulário para Manifestação', icon: MdContactMail, href: '/manifestacao' },
    ],
  },
  {
    titulo: 'Lei Geral de Proteção de Dados e Governo Digital',
    icon: MdSecurity,
    cor: 'secondary',
    itens: [
      { label: 'Perguntas Frequentes - FAQ', icon: MdHelpOutline, href: '/faq' },
      { label: 'Dados Abertos', icon: MdPublic, href: '/lgpd' },
    ],
  },
  {
    titulo: 'Renúncia de Receita e Emendas Parlamentares',
    icon: MdReceiptLong,
    cor: 'primary-light',
    itens: [
      { label: 'Execução Orçamentária (Emendas Parlamentares)', icon: MdEditNote, href: '/emendas-parlamentares/execucao-orcamentaria' },
      { label: 'Renúncias Fiscais', icon: MdPercent, href: '/renuncia-fiscal' },
    ],
  },
  {
    titulo: 'Saúde Pública',
    icon: MdLocalHospital,
    cor: 'accent-dark',
    itens: [
      { label: 'Conselho Municipal de Saúde', icon: MdGroup, href: '/conselho-saude' },
      { label: 'Unidades Saúde', icon: MdLocationOn, href: '/saude?categoria=unidade' },
      { label: 'Medicamentos', icon: MdLocalPharmacy, href: '/saude?categoria=medicamentos' },
      { label: 'Plano de Saúde, Relatório de Gestão, e Programação Anual', icon: MdHealthAndSafety, href: '/saude?categoria=planos' },
    ],
  },
  {
    titulo: 'Educação e Assistência Social',
    icon: MdSchool,
    cor: 'accent-light',
    itens: [
      { label: 'Conselho Municipal de Educação', icon: MdSchool, href: '/conselho-educacao' },
      { label: 'Conselho Municipal de Assistência Social', icon: MdVolunteerActivism, href: '/conselho-assistencia-social' },
      { label: 'Plano Educação', icon: MdMenuBook, href: '/educacao?categoria=planos' },
      { label: 'Lista de Solicitações de Matrículas', icon: MdAssignment, href: '/educacao?categoria=lista-solicitacao-matricula' },
      { label: 'Lista de Alunos', icon: MdPeopleAlt, href: '/educacao?categoria=lista-alunos' },
    ],
  },
  {
    titulo: 'Emendas Parlamentares',
    icon: MdPolicy,
    cor: 'primary-dark',
    itens: [
      { label: 'Emendas Federais', icon: MdPublic, href: '/emendas-federais' },
      { label: 'Emendas Estaduais', icon: MdLocationOn, href: '/emendas-estaduais' },
      { label: 'Emendas Municipais', icon: MdAccountBalance, href: '/emendas-municipais' },
      // "Execução Orçamentária e Financeira" ainda não tem página própria (backlog item 36) —
      // aponta pra Federais enquanto isso, mesmo placeholder que já existia antes desta PR.
      { label: 'Execução Orçamentária e Financeira', icon: MdAttachMoney, href: '/emendas-federais' },
    ],
  },
]
