export interface Unidade {
  id: number
  nome: string
}

export interface Servidor {
  id: number
  cpf: string
  name: string
  cargo: string
  unidade?: Unidade
  dataAdmissao: string
  cargaHoraria: number
}

export interface FiltroServidor {
  cpf?: string
  name?: string
  cargo?: string
  unidadeId?: number
  dataAdmissaoInicio?: string
  dataAdmissaoFim?: string
  cargaHoraria?: number
}

export interface FolhaPagamento {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  desconto: number
  salarioLiquido: number
}

export interface FolhaPagamentoServidor {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  descontos: number
  salarioLiquido: number
  nomeServidor: string
  cpfServidor: string
}

export type RecursoDocumentoRH = 'estagiarios' | 'terceirizados'
