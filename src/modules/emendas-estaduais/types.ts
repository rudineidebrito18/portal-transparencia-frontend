import { FonteEmenda, OrigemCadastroEmenda } from './enums'

export interface EmendaEstadual {
  id: number
  codigoEmenda: string
  ano: number | null
  parlamentarNome: string | null
  tipo: string | null
  modalidade: string | null
  unidadeGestora: string | null
  nomeUnidadeGestora: string | null
  empenhos: string | null
  entidadeBeneficiada: string | null
  localizadorGasto: string | null
  objeto: string | null
  funcao: string | null
  subfuncao: string | null
  acao: string | null
  subacao: string | null
  valorSolicitado: number | null
  valorRepasse: number | null
  valorPreEmpenhado: number | null
  valorEmpenhado: number | null
  valorLiquidado: number | null
  valorPago: number | null
  codigoFavorecido: string | null
  dataUltimaAtualizacaoFonte: string | null
  fonteOrigem: FonteEmenda
  origemCadastro: OrigemCadastroEmenda
  linkDetalhes: string | null
  dataUltimaSincronizacao: string | null
  criadoEm: string
  atualizadoEm: string
  situacao: string | null
  cadastroOficial: boolean | null
  dataCadastro: string | null
  parlamentarNomeCompleto: string | null
  parlamentarPartido: string | null
  parlamentarCargo: string | null
  parlamentarUf: string | null
  orgaoConcedenteEsfera: string | null
  orgaoConcedenteDescricao: string | null
  programaGovernamental: string | null
  codigoAcaoOrcamentaria: string | null
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
  valorSaldo: number | null
  percentualExecucao: number | null
  situacaoPrestacaoContas: string | null
}

// Mesmo shape do EmendaEstadualRequestDto do backend — usado tanto pra criar/editar manualmente
// quanto como retorno do preview da busca/descoberta assistida.
export interface EmendaEstadualRequest {
  codigoEmenda: string
  ano: number | null
  parlamentarNome: string | null
  tipo: string | null
  modalidade: string | null
  unidadeGestora: string | null
  nomeUnidadeGestora: string | null
  empenhos: string | null
  entidadeBeneficiada: string | null
  localizadorGasto: string | null
  objeto: string | null
  funcao: string | null
  subfuncao: string | null
  acao: string | null
  subacao: string | null
  valorSolicitado: number | null
  valorRepasse: number | null
  valorPreEmpenhado: number | null
  valorEmpenhado: number | null
  valorLiquidado: number | null
  valorPago: number | null
  codigoFavorecido: string | null
  fonteOrigem: FonteEmenda | null
  linkDetalhes: string | null
  viaBuscaAssistida?: boolean
  situacao: string | null
  cadastroOficial: boolean | null
  dataCadastro: string | null
  parlamentarNomeCompleto: string | null
  parlamentarPartido: string | null
  parlamentarCargo: string | null
  parlamentarUf: string | null
  orgaoConcedenteEsfera: string | null
  orgaoConcedenteDescricao: string | null
  programaGovernamental: string | null
  codigoAcaoOrcamentaria: string | null
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
  valorSaldo: number | null
  percentualExecucao: number | null
  situacaoPrestacaoContas: string | null
}

// Backend só filtra por ano (não tem endpoint de filtro por tipo/modalidade — são texto livre
// da fonte, sem um conjunto fechado de valores pra virar um <select>).
export interface FiltroEmendaEstadual {
  ano?: number
}

// Item de POST /emendas-estaduais/descobrir — busca por município (Localizador de Gasto), não
// exige código conhecido. Não persiste nada, o admin escolhe o que importar via POST /importar.
export interface EmendaEstadualDescoberta {
  dados: EmendaEstadualRequest
  jaCadastrada: boolean
}
