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
} from 'react-icons/md'
import { IconType } from 'react-icons'

export interface ItemAcesso {
  label: string
  href?: string
}

export interface SecaoAcesso {
  titulo: string
  icon: IconType
  itens: ItemAcesso[]
}

export const secoesAcessoInformacao: SecaoAcesso[] = [
  {
    titulo: 'Informações Institucionais',
    icon: MdAccountBalance,
    itens: [
      { label: 'Estrutura organizacional' },
      { label: 'Atos normativos próprios' },
      { label: 'Perguntas frequentes (FAQ)' },
      { label: 'Radar da transparência pública' },
      { label: 'Audiências públicas' },
    ],
  },
  {
    titulo: 'Execução Orçamentária e Financeira',
    icon: MdAttachMoney,
    itens: [
      { label: 'Receitas públicas', href: '/gestao-fiscal?categoria=execucao-orcamentaria' },
      { label: 'Despesas públicas', href: '/gestao-fiscal?categoria=execucao-orcamentaria' },
      { label: 'Dívida ativa', href: '/gestao-fiscal?categoria=divida-ativa' },
    ],
  },
  {
    titulo: 'Convênios e Transferências',
    icon: MdSwapHoriz,
    itens: [
      { label: 'Transferências voluntárias recebidas' },
      { label: 'Transferências voluntárias realizadas' },
      { label: 'Acordos firmados pelo órgão' },
    ],
  },
  {
    titulo: 'Recursos Humanos',
    icon: MdGroups,
    itens: [
      { label: 'Relação nominal de servidores', href: '/servidores' },
      { label: 'Remuneração nominal dos servidores', href: '/folha-pagamento' },
      { label: 'Tabela com padrão remuneratório' },
      { label: 'Estagiários' },
      { label: 'Terceirizados' },
      { label: 'Concursos e seleções públicas' },
    ],
  },
  {
    titulo: 'Diárias',
    icon: MdFlightTakeoff,
    itens: [
      { label: 'Diárias' },
      { label: 'Diárias — legislação e valores' },
      { label: 'Tabela de valores das diárias' },
    ],
  },
  {
    titulo: 'Licitações e Contratos',
    icon: MdGavel,
    itens: [
      { label: 'Licitações', href: '/licitacoes' },
      { label: 'Dispensas e inexigibilidade' },
      { label: 'Ato de adesão' },
      { label: 'PCA — Plano de contratação anual' },
      { label: 'Chamamento público' },
      { label: 'Empresas inidôneas/suspensas', href: '/gestao-fiscal?categoria=inidoneas' },
      { label: 'Contratos administrativos' },
      { label: 'Fiscal de contrato' },
      { label: 'Ordem cronológica' },
      { label: 'Avisos — Lei nº 14.133', href: '/avisos' },
      { label: 'Ata de registro de preço' },
    ],
  },
  {
    titulo: 'Obras Públicas',
    icon: MdConstruction,
    itens: [
      { label: 'Obras públicas' },
      { label: 'Obras paralisadas' },
    ],
  },
  {
    titulo: 'Planejamento e Prestação de Contas',
    icon: MdAssessment,
    itens: [
      { label: 'Prestação de contas (balanço geral)', href: '/prestacao-contas?categoria=balanco-geral' },
      { label: 'Relatórios de gestão e atividades' },
      { label: 'Julgamento das contas pelo tribunal de contas', href: '/prestacao-contas?categoria=julgamento-contas-tce' },
      { label: 'Julgamento das contas do executivo pelo legislativo', href: '/prestacao-contas?categoria=julgamento-contas-legislativo' },
      { label: 'RGF — Relatório de gestão fiscal', href: '/gestao-fiscal?categoria=rgf' },
      { label: 'RREO — Relatório resumido da execução orçamentária' },
      { label: 'PPA — Plano plurianual', href: '/planejamento?categoria=ppa' },
      { label: 'Plano estratégico institucional' },
      { label: 'LDO — Lei de diretrizes orçamentária', href: '/planejamento?categoria=ldo' },
      { label: 'LOA — Lei orçamentária anual', href: '/planejamento?categoria=loa' },
      { label: 'Relatório circunstanciado' },
    ],
  },
  {
    titulo: 'Ouvidoria e E-SIC',
    icon: MdRecordVoiceOver,
    itens: [
      { label: 'E-SIC' },
      { label: 'Regulamentação da LAI' },
      { label: 'Prazos de resposta — SIC' },
      { label: 'Relatório anual estatístico' },
      { label: 'Documentos classificados' },
      { label: 'Documentos desclassificados' },
      { label: 'Ouvidoria municipal' },
      { label: 'Carta de serviços' },
    ],
  },
  {
    titulo: 'Lei Geral de Proteção de Dados e Governo Digital',
    icon: MdSecurity,
    itens: [
      { label: 'Proteção de dados (LGPD)' },
      { label: 'Dados abertos' },
      { label: 'Regulamentação Lei Federal nº 14.129/2021' },
      { label: 'Pesquisa de satisfação' },
      { label: 'Serviços públicos' },
    ],
  },
  {
    titulo: 'Renúncia de Receita e Emendas Parlamentares',
    icon: MdReceiptLong,
    itens: [
      { label: 'Renúncias fiscais', href: '/gestao-fiscal?categoria=renuncia-fiscal' },
      { label: 'Emendas parlamentares' },
      { label: 'Transferências disciplinadas pela EC nº 105' },
    ],
  },
  {
    titulo: 'Saúde Pública',
    icon: MdLocalHospital,
    itens: [
      { label: 'Planos, relatórios e programação de saúde' },
      { label: 'Unidades de saúde' },
      { label: 'Lista de espera para consultas e exames' },
      { label: 'Medicamentos de alto custo (SUS)' },
      { label: 'Estoque de medicamentos' },
      { label: 'Conselho de saúde' },
    ],
  },
  {
    titulo: 'Educação e Assistência Social',
    icon: MdSchool,
    itens: [
      { label: 'Planos e relatórios de educação', href: '/educacao?categoria=planos' },
      { label: 'Lista de espera de creche', href: '/educacao?categoria=lista-espera-creche' },
      { label: 'Conselho do FUNDEB' },
      { label: 'Conselho de assistência social' },
    ],
  },
]
