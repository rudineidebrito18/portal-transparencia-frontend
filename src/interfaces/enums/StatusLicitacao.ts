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