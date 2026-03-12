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