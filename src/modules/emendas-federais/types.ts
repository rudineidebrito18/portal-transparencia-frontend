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
