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

export type StatusEsic = 'RECEBIDA' | 'EM_ANALISE' | 'RESPONDIDA' | 'INDEFERIDA'

export const LABELS_STATUS_ESIC: Record<StatusEsic, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em análise',
  RESPONDIDA: 'Respondida',
  INDEFERIDA: 'Indeferida'
}

// GET /esic/formulario/publicas — só grauSigilo=PUBLICO, sem nome/email/anonima/id
// (backend nunca inclui PII aqui, ver FormularioEsicPublicoDto).
export interface FormularioEsicPublico {
  protocolo: string
  tipoSolicitacao: TipoSolicitacaoEsic
  solicitacao: string
  resposta: string | null
  status: StatusEsic
  criadoEm: string
}

export type GrauSigilo = 'PUBLICO' | 'RESERVADO' | 'SECRETO' | 'ULTRASSECRETO'

export const LABELS_GRAU_SIGILO: Record<GrauSigilo, string> = {
  PUBLICO: 'Público',
  RESERVADO: 'Reservado',
  SECRETO: 'Secreto',
  ULTRASSECRETO: 'Ultrassecreto'
}

// GET /esic/documentos-classificados-sigilo — Rol de Informações Classificadas (LAI, art. 30).
// descricao/data não-nulos de propósito (mesmo shape de DocumentoGenericoAdmin) — o formulário
// de admin exige os dois; só os campos extras (numero/dataClassificacao/grauSigilo) são opcionais.
export interface DocumentoClassificadoSigilo {
  id: number
  numero: string | null
  descricao: string
  data: string
  dataClassificacao: string | null
  grauSigilo: GrauSigilo | null
  caminhoArquivo: string
}

export interface DocumentoClassificadoSigiloRequest {
  numero: string | null
  descricao: string | null
  data: string | null
  dataClassificacao: string | null
  grauSigilo: GrauSigilo | null
}
