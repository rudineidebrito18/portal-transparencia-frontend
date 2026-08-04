export interface InformacoesOuvidoria {
  id: number
  endereco: string
  horarioAtendimento: string
  telefone: string
  email: string
  responsavel: string
  prazos: string
  unidadeNome: string
}

export type FinalidadeOuvidoria = 'DENUNCIA' | 'ELOGIO' | 'RECLAMACAO' | 'SOLICITACAO' | 'SUGESTAO'

export const LABELS_FINALIDADE_OUVIDORIA: Record<FinalidadeOuvidoria, string> = {
  DENUNCIA: 'Denúncia',
  ELOGIO: 'Elogio',
  RECLAMACAO: 'Reclamação',
  SOLICITACAO: 'Solicitação',
  SUGESTAO: 'Sugestão'
}

// Cidadão envia direto pelo site público (POST /ouvidoria/formulario, multipart) —
// nome/email só fazem sentido quando a manifestação não é anônima.
export interface FormularioOuvidoriaRequest {
  unidadeId: number
  finalidade: FinalidadeOuvidoria
  anonima: boolean
  nome?: string
  email?: string
  comentario: string
}
