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

export const StatusLicitacaoStyle: Record<StatusLicitacao, string> = {
  [StatusLicitacao.EM_ABERTO]: "bg-blue-100 text-blue-700",
  [StatusLicitacao.EM_ANDAMENTO]: "bg-yellow-100 text-yellow-700",
  [StatusLicitacao.FINALIZADO]: "bg-green-100 text-green-700",
  [StatusLicitacao.SUSPENSO]: "bg-red-100 text-red-700",
  [StatusLicitacao.DESERTA]: "bg-gray-100 text-gray-600",
  [StatusLicitacao.FRACASSADA]: "bg-gray-100 text-gray-600",
  [StatusLicitacao.ANULADA]: "bg-red-100 text-red-700",
  [StatusLicitacao.SINC_ABERTO]: "bg-blue-100 text-blue-700",
  [StatusLicitacao.SINC_ANDAMENTO]: "bg-yellow-100 text-yellow-700",
  [StatusLicitacao.INCLUIDO_SISTEMA]: "bg-gray-100 text-gray-600"
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
