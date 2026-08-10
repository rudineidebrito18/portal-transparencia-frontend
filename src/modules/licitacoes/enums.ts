export enum StatusLicitacao {
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FRACASSADA = "FRACASSADA",
  EM_ABERTO = "EM_ABERTO",
  FINALIZADO = "FINALIZADO",
  SINC_ABERTO = "SINC_ABERTO",
  SINC_ANDAMENTO = "SINC_ANDAMENTO",
  INCLUIDO_SISTEMA = "INCLUIDO_SISTEMA",
  SUSPENSO = "SUSPENSO",
  DESERTA = "DESERTA",
  ANULADA = "ANULADA"
}

export const StatusLicitacaoDescricao: Record<StatusLicitacao, string> = {
  [StatusLicitacao.EM_ANDAMENTO]: "Em andamento",
  [StatusLicitacao.FRACASSADA]: "Fracassada",
  [StatusLicitacao.EM_ABERTO]: "Em aberto",
  [StatusLicitacao.FINALIZADO]: "Finalizado",
  [StatusLicitacao.SINC_ABERTO]: "Enviado ao SINC-Contrata / Em aberto",
  [StatusLicitacao.SINC_ANDAMENTO]: "Enviado ao SINC-Contrata / Em andamento",
  [StatusLicitacao.INCLUIDO_SISTEMA]: "Incluído pelo sistema",
  [StatusLicitacao.SUSPENSO]: "Suspenso",
  [StatusLicitacao.DESERTA]: "Deserta",
  [StatusLicitacao.ANULADA]: "Anulada"
}

import { STATUS_BADGE_DOT, STATUS_BADGE_STYLE } from "@/modules/shared/statusBadgeStyle"

// SUSPENSO usava vermelho aqui e cinza em Contratos pro mesmo conceito — unificado via
// STATUS_BADGE_STYLE (mesma paleta semântica compartilhada entre Contratos/Licitações/Obras).
export const StatusLicitacaoStyle: Record<StatusLicitacao, string> = {
  [StatusLicitacao.EM_ABERTO]: STATUS_BADGE_STYLE.info,
  [StatusLicitacao.EM_ANDAMENTO]: STATUS_BADGE_STYLE.emAndamento,
  [StatusLicitacao.FINALIZADO]: STATUS_BADGE_STYLE.concluido,
  [StatusLicitacao.SUSPENSO]: STATUS_BADGE_STYLE.suspenso,
  [StatusLicitacao.DESERTA]: STATUS_BADGE_STYLE.neutro,
  [StatusLicitacao.FRACASSADA]: STATUS_BADGE_STYLE.neutro,
  [StatusLicitacao.ANULADA]: STATUS_BADGE_STYLE.cancelado,
  [StatusLicitacao.SINC_ABERTO]: STATUS_BADGE_STYLE.info,
  [StatusLicitacao.SINC_ANDAMENTO]: STATUS_BADGE_STYLE.emAndamento,
  [StatusLicitacao.INCLUIDO_SISTEMA]: STATUS_BADGE_STYLE.neutro
}

// Espelha o mapa acima, categoria por categoria, só que pro indicador sólido
// (Badge.tsx `dotClassName`) em vez da pílula clara.
export const StatusLicitacaoDot: Record<StatusLicitacao, string> = {
  [StatusLicitacao.EM_ABERTO]: STATUS_BADGE_DOT.info,
  [StatusLicitacao.EM_ANDAMENTO]: STATUS_BADGE_DOT.emAndamento,
  [StatusLicitacao.FINALIZADO]: STATUS_BADGE_DOT.concluido,
  [StatusLicitacao.SUSPENSO]: STATUS_BADGE_DOT.suspenso,
  [StatusLicitacao.DESERTA]: STATUS_BADGE_DOT.neutro,
  [StatusLicitacao.FRACASSADA]: STATUS_BADGE_DOT.neutro,
  [StatusLicitacao.ANULADA]: STATUS_BADGE_DOT.cancelado,
  [StatusLicitacao.SINC_ABERTO]: STATUS_BADGE_DOT.info,
  [StatusLicitacao.SINC_ANDAMENTO]: STATUS_BADGE_DOT.emAndamento,
  [StatusLicitacao.INCLUIDO_SISTEMA]: STATUS_BADGE_DOT.neutro
}

export enum TipoProcedimentoLicitacao {
  AARP = "AARP",
  CC = "CC",
  CP = "CP",
  CRED = "CRED",
  DC = "DC",
  DP = "DP",
  DEL = "DEL",
  IN = "IN",
  LE = "LE",
  LI = "LI",
  OUTROS = "OUTROS",
  PE = "PE",
  PP = "PP",
  PL_2016 = "PL_2016",
  RDC_E = "RDC_E",
  RDC_P = "RDC_P",
  TP = "TP"
}

export const TipoProcedimentoDescricao: Record<TipoProcedimentoLicitacao, string> = {
  [TipoProcedimentoLicitacao.AARP]: "Adesão à Ata de Registro de Preços",
  [TipoProcedimentoLicitacao.CC]: "Carta Convite",
  [TipoProcedimentoLicitacao.CP]: "Concorrência Pública",
  [TipoProcedimentoLicitacao.CRED]: "Credenciamento",
  [TipoProcedimentoLicitacao.DC]: "Diálogo Competitivo",
  [TipoProcedimentoLicitacao.DP]: "Dispensa",
  [TipoProcedimentoLicitacao.DEL]: "Dispensa Eletrônica de Licitação",
  [TipoProcedimentoLicitacao.IN]: "Inexigibilidade",
  [TipoProcedimentoLicitacao.LE]: "Leilão",
  [TipoProcedimentoLicitacao.LI]: "Licitação Internacional",
  [TipoProcedimentoLicitacao.OUTROS]: "Outros",
  [TipoProcedimentoLicitacao.PE]: "Pregão Eletrônico",
  [TipoProcedimentoLicitacao.PP]: "Pregão Presencial",
  [TipoProcedimentoLicitacao.PL_2016]: "Procedimento da Lei 13.103/2016",
  [TipoProcedimentoLicitacao.RDC_E]: "RDC Eletrônico",
  [TipoProcedimentoLicitacao.RDC_P]: "RDC Presencial",
  [TipoProcedimentoLicitacao.TP]: "Tomada de Preços"
}
