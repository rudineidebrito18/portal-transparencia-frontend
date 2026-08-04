// Paleta compartilhada pra badge de status entre Contratos, Licitações e Obras — antes cada
// módulo tinha seu próprio mapa ad-hoc e o mesmo conceito (ex: "suspenso") saía com cor
// diferente dependendo do módulo. Categorias são semânticas, não amarradas a um enum
// específico — cada módulo decide qual categoria cada um dos seus status usa.
export const STATUS_BADGE_STYLE = {
  emAndamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  suspenso: 'bg-gray-100 text-gray-600',
  neutro: 'bg-gray-100 text-gray-600',
  info: 'bg-blue-100 text-blue-700'
} as const
