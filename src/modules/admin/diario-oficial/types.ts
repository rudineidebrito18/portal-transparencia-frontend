export type { EdicaoDiario, FiltroEdicaoDiario } from '@/modules/diario-oficial/types'
export { TipoEdicaoDiario, TipoEdicaoDiarioDescricao, TipoEdicaoDiarioStyle } from '@/modules/diario-oficial/enums'

export interface DiarioOficialInfo {
  name: string
  issn: string
  email: string
  telefone: string
  editorChefe: string
  redacao: string
  endereco: string
  pathBrasao: string
  pathLogo: string
}

export type DiarioOficialInfoRequest = Omit<DiarioOficialInfo, 'pathBrasao' | 'pathLogo'>

export enum StatusPublicacaoDiario {
  RECEBIDO = 'RECEBIDO',
  VALIDANDO = 'VALIDANDO',
  MONTANDO_DOCUMENTO_OFICIAL = 'MONTANDO_DOCUMENTO_OFICIAL',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  ASSINANDO = 'ASSINANDO',
  PUBLICADO = 'PUBLICADO',
  FALHOU = 'FALHOU'
}

// O enum StatusPublicacaoDiario não tem descrição no backend (sem getDescricao(), diferente
// de StatusLicitacao) — Jackson serializa a própria chave do enum, sem precisar de conversão.
export const StatusPublicacaoDiarioDescricao: Record<StatusPublicacaoDiario, string> = {
  [StatusPublicacaoDiario.RECEBIDO]: 'Recebido',
  [StatusPublicacaoDiario.VALIDANDO]: 'Validando',
  [StatusPublicacaoDiario.MONTANDO_DOCUMENTO_OFICIAL]: 'Montando documento oficial',
  [StatusPublicacaoDiario.AGUARDANDO_APROVACAO]: 'Aguardando aprovação',
  [StatusPublicacaoDiario.ASSINANDO]: 'Assinando',
  [StatusPublicacaoDiario.PUBLICADO]: 'Publicado',
  [StatusPublicacaoDiario.FALHOU]: 'Falhou'
}

export const StatusPublicacaoDiarioStyle: Record<StatusPublicacaoDiario, string> = {
  [StatusPublicacaoDiario.RECEBIDO]: 'bg-gray-100 text-gray-600',
  [StatusPublicacaoDiario.VALIDANDO]: 'bg-blue-100 text-blue-700',
  [StatusPublicacaoDiario.MONTANDO_DOCUMENTO_OFICIAL]: 'bg-blue-100 text-blue-700',
  [StatusPublicacaoDiario.AGUARDANDO_APROVACAO]: 'bg-yellow-100 text-yellow-700',
  [StatusPublicacaoDiario.ASSINANDO]: 'bg-blue-100 text-blue-700',
  [StatusPublicacaoDiario.PUBLICADO]: 'bg-green-100 text-green-700',
  [StatusPublicacaoDiario.FALHOU]: 'bg-red-100 text-red-700'
}

export interface SolicitacaoPublicacaoRequest {
  numeroEdicao: number
  dataPublicacao: string
  tipo: string
  volume?: number
  descricao?: string
}

// Response não ecoa de volta dataPublicacao/tipo/volume/descricao — só o que o pipeline
// controla (status do processamento).
export interface SolicitacaoPublicacao {
  id: number
  numeroEdicao: number
  status: StatusPublicacaoDiario
  etapaFalha?: StatusPublicacaoDiario
  motivoFalha?: string
  tentativas: number
  edicaoDiarioId?: number
  criadoEm: string
  atualizadoEm: string
}

export interface FiltroSolicitacaoPublicacao {
  status?: StatusPublicacaoDiario
}

export interface LogEtapaProcessamento {
  etapa: StatusPublicacaoDiario
  sucesso: boolean
  mensagem?: string
  duracaoMs: number
  criadoEm: string
}
