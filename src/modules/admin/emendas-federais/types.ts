// Mesmo shape do módulo público — o admin usa o mesmo DTO de request tanto pra cadastro manual
// quanto pra confirmar o preview da busca assistida (ver emendaFederal.service.ts#buscarAssistido).
export type { EmendaFederal, EmendaFederalRequest, FiltroEmendaFederal, EmendaFederalDescoberta } from '@/modules/emendas-federais/types'
