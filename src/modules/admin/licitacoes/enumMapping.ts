import {
  StatusLicitacao,
  StatusLicitacaoDescricao,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao
} from '@/modules/licitacoes/enums'

// Backend devolve a descrição textual do enum (ex: "EM ABERTO"), não a chave (ex:
// "EM_ABERTO") — usado tanto pra achar o estilo do Badge quanto pra pré-popular o <select>
// de formulários de edição com a opção certa.
export function normalizarStatus(valor: string): StatusLicitacao | undefined {
  const chave = valor.toUpperCase().replace(/\s+/g, '_') as StatusLicitacao
  return chave in StatusLicitacaoDescricao ? chave : undefined
}

// Sem transformação mecânica possível pra tipo de procedimento (as descrições não seguem um
// padrão de caixa/espaço previsível) — busca reversa no dicionário de descrições.
export function normalizarTipoProcedimento(valor: string): TipoProcedimentoLicitacao | undefined {
  return (Object.keys(TipoProcedimentoDescricao) as TipoProcedimentoLicitacao[]).find(
    chave => TipoProcedimentoDescricao[chave] === valor
  )
}
