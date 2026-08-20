import { FonteEmenda, FormaRepasseEmenda, OrigemCadastroEmenda, TipoEmenda } from './enums'

export interface EmendaFederal {
  id: number
  codigoEmenda: string
  ano: number | null
  tipoEmenda: TipoEmenda | null
  autorNome: string | null
  autorCargo: string | null
  autorPartido: string | null
  autorCodigo: string | null
  formaRepasse: FormaRepasseEmenda | null
  valorIndicado: number | null
  valorEmpenhado: number | null
  valorLiquidado: number | null
  valorPago: number | null
  situacao: string | null
  localidadeDoGasto: string | null
  objeto: string | null
  programa: string | null
  fonteOrigem: FonteEmenda
  origemCadastro: OrigemCadastroEmenda
  linkDetalhes: string | null
  dataUltimaSincronizacao: string | null
  criadoEm: string
  atualizadoEm: string
  cadastroOficial: boolean | null
  dataCadastro: string | null
  autorNomeCompleto: string | null
  autorUf: string | null
  orgaoConcedenteEsfera: string | null
  orgaoConcedenteDescricao: string | null
  codigoAcaoOrcamentaria: string | null
  descricaoAcaoOrcamentaria: string | null
  enteBeneficiario: string | null
  contaBancoNome: string | null
  contaBancoAgencia: string | null
  contaBancoNumero: string | null
  naturezaDespesa: string | null
  codigoElementoDespesa: string | null
  descricaoElementoDespesa: string | null
  numeroConvenio: string | null
  gestorEmenda: string | null
  responsavelControleInterno: string | null
  numeroEmpenho: string | null
  valorRepassado: number | null
  valorSaldo: number | null
  percentualExecucao: number | null
  situacaoPrestacaoContas: string | null
}

// Mesmo shape do EmendaFederalRequestDto do backend — usado tanto pra criar/editar manualmente
// quanto como retorno do preview da busca assistida (POST /buscar), que o admin revisa antes
// de confirmar via POST normal.
export interface EmendaFederalRequest {
  codigoEmenda: string
  ano: number | null
  tipoEmenda: TipoEmenda | null
  autorNome: string | null
  autorCargo: string | null
  autorPartido: string | null
  autorCodigo: string | null
  formaRepasse: FormaRepasseEmenda | null
  valorIndicado: number | null
  valorEmpenhado: number | null
  valorLiquidado: number | null
  valorPago: number | null
  situacao: string | null
  localidadeDoGasto: string | null
  objeto: string | null
  programa: string | null
  fonteOrigem: FonteEmenda | null
  linkDetalhes: string | null
  viaBuscaAssistida?: boolean
  cadastroOficial: boolean | null
  dataCadastro: string | null
  autorNomeCompleto: string | null
  autorUf: string | null
  orgaoConcedenteEsfera: string | null
  orgaoConcedenteDescricao: string | null
  codigoAcaoOrcamentaria: string | null
  descricaoAcaoOrcamentaria: string | null
  enteBeneficiario: string | null
  contaBancoNome: string | null
  contaBancoAgencia: string | null
  contaBancoNumero: string | null
  naturezaDespesa: string | null
  codigoElementoDespesa: string | null
  descricaoElementoDespesa: string | null
  numeroConvenio: string | null
  gestorEmenda: string | null
  responsavelControleInterno: string | null
  numeroEmpenho: string | null
  valorRepassado: number | null
  valorSaldo: number | null
  percentualExecucao: number | null
  situacaoPrestacaoContas: string | null
}

// Backend filtra por tipo OU por ano (endpoints separados /tipo/{tipo} e /ano/{ano}),
// sem combinação dos dois — mesma regra que já existia no módulo antigo.
export interface FiltroEmendaFederal {
  tipo?: string
  ano?: number
}

// Item de POST /emendas-federais/descobrir — busca por CNPJ do município (sem exigir código
// conhecido), não persiste nada, o admin escolhe o que importar via POST /importar.
export interface EmendaFederalDescoberta {
  dados: EmendaFederalRequest
  jaCadastrada: boolean
}
