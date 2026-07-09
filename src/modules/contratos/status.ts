// O backend não expõe um enum formal pra status de contrato (é string livre),
// por isso este mapa é best-effort e cai num estilo neutro pra valores desconhecidos.
const CONTRATO_STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  RESCINDIDO: 'bg-red-100 text-red-700',
  SUSPENSO: 'bg-gray-100 text-gray-600'
}

export function contratoStatusStyle(status: string): string {
  return CONTRATO_STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'
}

export function contratoStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}
