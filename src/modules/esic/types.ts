export interface InformacoesEsic {
  id: number
  enderecoAtendimento: string
  horarioInicioManha: string
  horarioFimManha: string
  horarioInicioTarde: string
  horarioFimTarde: string
  telefone: string
  email: string
  nomeResponsavel: string
  prazoRespostaDisponivel: number
  prazoRespostaBusca: number
}

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

// Cidadão envia direto pelo site público (POST /esic/formulario) — nome/email só
// fazem sentido quando a solicitação não é anônima.
export interface FormularioEsicRequest {
  tipoSolicitacao: TipoSolicitacaoEsic
  solicitacao: string
  anonima: boolean
  nome?: string
  email?: string
}
