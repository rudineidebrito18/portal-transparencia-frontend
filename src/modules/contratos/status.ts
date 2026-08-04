import { STATUS_BADGE_STYLE } from '@/modules/shared/statusBadgeStyle'

// O backend não expõe um enum formal pra status de contrato (é string livre),
// por isso este mapa é best-effort e cai num estilo neutro pra valores desconhecidos.
const CONTRATO_STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: STATUS_BADGE_STYLE.emAndamento,
  CONCLUIDO: STATUS_BADGE_STYLE.concluido,
  RESCINDIDO: STATUS_BADGE_STYLE.cancelado,
  SUSPENSO: STATUS_BADGE_STYLE.suspenso
}

export function contratoStatusStyle(status: string): string {
  return CONTRATO_STATUS_STYLE[status] ?? STATUS_BADGE_STYLE.neutro
}

export function contratoStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}
