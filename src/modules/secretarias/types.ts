export interface Unidade {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
  horarioAtendimento: string
  endereco: string
  atribuicoes: string
  gestorNome: string
  gestorCargo: string
  gestorFotoUrl: string | null
  gestorVerificado: boolean
  dataInicio: string | null
  dataFim: string | null
}

export interface FiltroSecretaria {
  nome?: string
  vigencia?: string
}

export interface Decreto {
  id: number
  descricao: string
  data: string
  arquivoUrl: string
}

export enum TipoDocumentoUnidade {
  TERMO = 'TERMO',
  EDTC = 'EDTC',
  DECLARACAO_ESIC = 'DECLARACAO_ESIC'
}

export const TipoDocumentoUnidadeDescricao: Record<TipoDocumentoUnidade, string> = {
  [TipoDocumentoUnidade.TERMO]: 'Termo',
  [TipoDocumentoUnidade.EDTC]: 'EDTC',
  [TipoDocumentoUnidade.DECLARACAO_ESIC]: 'Declaração E-SIC'
}

export interface DocumentoUnidade {
  id: number
  tipo: TipoDocumentoUnidade
  arquivoUrl: string
  dataEnvio: string
}

// Ex-gestores e ordenadores de despesa têm exatamente a mesma forma no backend.
export interface PessoaCargoUnidade {
  id: number
  nome: string
  cargo: string
  dataInicio: string
  dataFim: string
}

export interface SetorUnidade {
  id: number
  nome: string
  descricao: string
}

// Backend não agrega os sub-recursos na resposta da unidade — a tela de detalhe
// precisa buscar os 6 recursos em paralelo (1 unidade + 5 sub-recursos).
export interface SecretariaDetalhe {
  unidade: Unidade
  decretos: Decreto[]
  documentos: DocumentoUnidade[]
  exGestores: PessoaCargoUnidade[]
  ordenadores: PessoaCargoUnidade[]
  setores: SetorUnidade[]
}
