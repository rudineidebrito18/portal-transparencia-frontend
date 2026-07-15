export type AcaoAuditoria = 'CRIACAO' | 'EDICAO' | 'EXCLUSAO'

export interface AuditLog {
  id: number
  usuarioId: number
  usuarioEmail: string
  acao: AcaoAuditoria
  modulo: string
  entidadeId: number
  dataHora: string
  detalhes: string | null
}

export interface FiltroAuditoria {
  usuarioId?: number
  modulo?: string
  dataInicial?: string
  dataFinal?: string
}
