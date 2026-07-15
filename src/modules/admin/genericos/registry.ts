import { Papel } from '@/modules/auth/types'

export interface ModuloGenericoConfig {
  slug: string
  label: string
  categoria: string
  basePath: string
  comIntervalo: boolean
  // Nível mínimo pra editar/excluir — criar é sempre ROLE_MANAGER (seção 4/6.7
  // do prompt-frontend-dashboard-admin.md). Valor vem direto da coluna
  // "Editar/excluir" de cada linha das tabelas da seção 6.7 (não é derivado
  // do agrupamento mais genérico da seção 5 — alguns módulos "fiscais" como
  // Renúncia Fiscal ficam em ROLE_MANAGER porque não estão na lista nomeada
  // da seção 5 pro grupo Fiscal/Orçamentário).
  papelMinimoEdicao: Papel
}

export const REGISTRY_MODULOS_GENERICOS: ModuloGenericoConfig[] = [
  // Forma padrão: { descricao, data }
  { slug: 'renuncia-fiscal', label: 'Renúncia Fiscal', categoria: 'Fiscal e Orçamentário', basePath: '/gestao-fiscal/renuncia-fiscal', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'fiscal-contratos', label: 'Fiscal de Contratos', categoria: 'Licitações', basePath: '/licitacao/fiscal-contratos', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'terceirizados', label: 'Terceirizados', categoria: 'Recursos Humanos', basePath: '/recursos-humanos/terceirizados', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'estagiarios', label: 'Estagiários', categoria: 'Recursos Humanos', basePath: '/recursos-humanos/estagiarios', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'ppa', label: 'PPA', categoria: 'Planejamento', basePath: '/planejamento/ppa', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'ldo', label: 'LDO', categoria: 'Planejamento', basePath: '/planejamento/ldo', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'loa', label: 'LOA', categoria: 'Planejamento', basePath: '/planejamento/loa', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'transferencia-voluntaria', label: 'Transferência Voluntária (EC 105)', categoria: 'Convênios e Repasses', basePath: '/execucao-orcamentaria/transferencia-voluntaria', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'julgamento-contas-legislativo', label: 'Julgamento de Contas (Legislativo)', categoria: 'Prestação de Contas', basePath: '/prestacao-contas/julgamento-contas-legislativo', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'balanco-geral', label: 'Balanço Geral', categoria: 'Prestação de Contas', basePath: '/prestacao-contas/balanco-geral', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'parecer-previo', label: 'Parecer Prévio', categoria: 'Prestação de Contas', basePath: '/prestacao-contas/parecer-previo', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'julgamento-contas-tce', label: 'Julgamento de Contas (TCE)', categoria: 'Prestação de Contas', basePath: '/prestacao-contas/julgamento-contas-tce', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'prestacao-contas-anos-anteriores', label: 'Prestação de Contas — Anos Anteriores', categoria: 'Prestação de Contas', basePath: '/prestacao-contas/prestacao-contas-anos-anteriores', comIntervalo: false, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'lei', label: 'Lei', categoria: 'Legislação', basePath: '/legislacao/lei', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'unidade-saude', label: 'Unidade de Saúde', categoria: 'Saúde', basePath: '/saude/unidade', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'medicamentos', label: 'Lista de Medicamentos', categoria: 'Saúde', basePath: '/saude/medicamentos', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'relatorios-saude', label: 'Relatório de Saúde', categoria: 'Saúde', basePath: '/saude/relatorios', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'planos-saude', label: 'Plano de Saúde', categoria: 'Saúde', basePath: '/saude/planos', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'lista-espera-creche', label: 'Lista de Espera — Creche', categoria: 'Educação', basePath: '/educacao/lista-espera-creche', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'lista-solicitacao-matricula', label: 'Lista de Solicitação de Matrícula', categoria: 'Educação', basePath: '/educacao/lista-solicitacao-matricula', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'planos-educacao', label: 'Plano de Educação', categoria: 'Educação', basePath: '/educacao/planos', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'rga', label: 'RGA (Relatório de Gestão de Atividade)', categoria: 'Planejamento', basePath: '/planejamento/rga', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'lista-alunos', label: 'Lista de Alunos', categoria: 'Educação', basePath: '/educacao/lista-alunos', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },
  { slug: 'plano-estrategico', label: 'Plano Estratégico', categoria: 'Planejamento', basePath: '/planejamento/plano-estrategico', comIntervalo: false, papelMinimoEdicao: 'ROLE_MANAGER' },

  // Forma com intervalo de data: acrescenta { dataInicio, dataFim }
  { slug: 'acordo-firmado-orgao', label: 'Acordo Firmado com Órgão', categoria: 'Convênios e Repasses', basePath: '/convenios/acordos-firmados-orgao', comIntervalo: true, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'convenio-transferencia-realizada', label: 'Convênio — Transferência Realizada', categoria: 'Convênios e Repasses', basePath: '/convenios-transferencias-realizadas', comIntervalo: true, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' },
  { slug: 'convenio-transferencia-recebida', label: 'Convênio — Transferência Recebida', categoria: 'Convênios e Repasses', basePath: '/convenios-transferencias-recebidas', comIntervalo: true, papelMinimoEdicao: 'ROLE_ADMINISTRATOR' }
]

export function obterModuloGenerico(slug: string): ModuloGenericoConfig | undefined {
  return REGISTRY_MODULOS_GENERICOS.find(m => m.slug === slug)
}
