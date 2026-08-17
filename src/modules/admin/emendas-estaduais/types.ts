// Mesmo shape do módulo público — o admin usa o mesmo DTO de request tanto pra cadastro manual
// quanto pra confirmar o preview da busca/descoberta assistida (ver emendaEstadual.service.ts).
export type { EmendaEstadual, EmendaEstadualRequest, FiltroEmendaEstadual, EmendaEstadualDescoberta } from '@/modules/emendas-estaduais/types'
