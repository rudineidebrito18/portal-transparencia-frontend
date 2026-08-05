// Gestor agora é histórico (N registros por unidade, só 1 ativo por vez) — Unidade só
// referencia o vigente. gestorAtual vem null se a unidade ainda não tem nenhum gestor.
export interface GestorUnidade {
  id: number
  nome: string
  cargo: string
  dataInicio: string | null
  dataFim: string | null
  fotoUrl: string | null
  verificado: boolean
  ativo: boolean
  // null nos registros migrados da era pré-histórico (2026-08-05) que não tinham
  // esse campo — confirmado em runtime (GET .../gestores devolveu criadoEm: null
  // pro gestor que já existia antes da migration).
  criadoEm: string | null
}

export interface Unidade {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
  horarioAtendimento: string
  endereco: string
  atribuicoes: string
  gestorAtual: GestorUnidade | null
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

// Só Ordenador de despesa usa esse formato agora — Gestor (GestorUnidade acima) divergiu
// em 2026-08-05 (virou histórico com foto/verificado/ativo).
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
  gestores: GestorUnidade[]
  ordenadores: PessoaCargoUnidade[]
  setores: SetorUnidade[]
}
