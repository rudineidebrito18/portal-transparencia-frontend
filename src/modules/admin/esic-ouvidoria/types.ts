export type TipoSolicitacaoEsic =
  | 'SOLICITACAO_INFORMACAO'
  | 'SOLICITACAO_INFORMACAO_SIGILOSA'
  | 'ELOGIO'
  | 'DENUNCIA'
  | 'RECLAMACAO'
  | 'DUVIDA'
  | 'SUGESTAO'
  | 'URGENCIA'

export const LABELS_TIPO_SOLICITACAO_ESIC: Record<TipoSolicitacaoEsic, string> = {
  SOLICITACAO_INFORMACAO: 'Solicitação de informação',
  SOLICITACAO_INFORMACAO_SIGILOSA: 'Solicitação de informação sigilosa',
  ELOGIO: 'Elogio',
  DENUNCIA: 'Denúncia',
  RECLAMACAO: 'Reclamação',
  DUVIDA: 'Dúvida',
  SUGESTAO: 'Sugestão',
  URGENCIA: 'Urgência'
}

export interface EsicInfo {
  id: number
  enderecoAtendimento: string
  horarioInicioManha: string
  horarioFimManha: string
  horarioInicioTarde: string
  horarioFimTarde: string
  telefone: string
  email: string
  nomeResponsavel: string
  unidadeResponsavelId: number
  prazoRespostaDisponivel: number
  prazoRespostaBusca: number
}

export type EsicInfoRequest = Omit<EsicInfo, 'id'>

export interface FormularioEsic {
  id: number
  tipoSolicitacao: TipoSolicitacaoEsic
  solicitacao: string
  anonima: boolean
  nome: string
  email: string
  criadoEm: string
}

export interface FiltroFormularioEsic {
  tipoSolicitacao?: TipoSolicitacaoEsic
  nome?: string
  email?: string
  dataInicial?: string
  dataFinal?: string
}

export interface OuvidoriaInfo {
  id: number
  endereco: string
  horarioAtendimento: string
  telefone: string
  email: string
  responsavel: string
  prazos: string
  // Resposta do backend só traz o nome, não o id — GET /ouvidoria/info não
  // devolve unidadeId (ver InfosOuvidoriaResponseDto no spec real).
  unidadeNome: string
}

export interface OuvidoriaInfoRequest {
  endereco: string
  horarioAtendimento: string
  telefone: string
  email: string
  responsavel: string
  prazos: string
  unidadeId: number
}
