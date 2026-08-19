export interface Unidade {
  id: number
  nome: string
}

// Um servidor pode ter mais de um cargo (ex.: professor + coordenador, ou dois vínculos em
// unidades diferentes) — cada um com unidade/carga horária/data de admissão próprios, todos com
// o mesmo peso (sem hierarquia entre eles).
export interface ServidorCargo {
  id: number
  cargo: string
  codigoCargo?: string
  codigoOrgao?: string
  unidade?: Unidade
  dataAdmissao?: string
  cargaHoraria?: number
  ativo: boolean
}

export interface Servidor {
  id: number
  cpf: string
  name: string
  status: 'ATIVO' | 'DESLIGADO'
  cargos: ServidorCargo[]
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
  cargo?: string
  unidadeNome?: string
  cargaHoraria?: number
  dataAdmissao?: string
}

export interface FiltroFolhaPagamento {
  mes?: number
  ano?: number
  nomeServidor?: string
  cpf?: string
  cargo?: string
  unidadeId?: number
}

export type RecursoDocumentoRH = 'estagiarios' | 'terceirizados'
