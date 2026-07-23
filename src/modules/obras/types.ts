export enum TipoObra {
  CONSTRUCAO = 'CONSTRUCAO',
  IMPLANTACAO = 'IMPLANTACAO',
  MANUTENCAO = 'MANUTENCAO',
  OUTROS = 'OUTROS',
  REFORMA = 'REFORMA',
  REPARO = 'REPARO',
  RESTAURACAO = 'RESTAURACAO'
}

export const TipoObraDescricao: Record<TipoObra, string> = {
  [TipoObra.CONSTRUCAO]: 'Construção',
  [TipoObra.IMPLANTACAO]: 'Implantação',
  [TipoObra.MANUTENCAO]: 'Manutenção',
  [TipoObra.OUTROS]: 'Outros',
  [TipoObra.REFORMA]: 'Reforma',
  [TipoObra.REPARO]: 'Reparo',
  [TipoObra.RESTAURACAO]: 'Restauração'
}

export enum StatusObra {
  CANCELADA = 'CANCELADA',
  CONCLUIDA = 'CONCLUIDA',
  EM_ANDAMENTO = 'EM_ANDAMENTO'
}

export const StatusObraDescricao: Record<StatusObra, string> = {
  [StatusObra.CANCELADA]: 'Cancelada',
  [StatusObra.CONCLUIDA]: 'Concluída',
  [StatusObra.EM_ANDAMENTO]: 'Em andamento'
}

export const StatusObraStyle: Record<StatusObra, string> = {
  [StatusObra.CANCELADA]: 'bg-red-100 text-red-700',
  [StatusObra.CONCLUIDA]: 'bg-green-100 text-green-700',
  [StatusObra.EM_ANDAMENTO]: 'bg-yellow-100 text-yellow-700'
}

export interface ObraPublica {
  id: number
  numero: number
  dataInicio: string
  dataPrevistaTermino: string
  dataTermino?: string
  ultimaAtualizacao: string
  valorTotal: number
  tipo: TipoObra
  status: StatusObra
  paralisada: boolean
  fonte: string
  local: string
  objeto: string
  unidadeId: number
  nomeUnidade: string
  fornecedorId: number
  nomeFornecedor: string
  totalObra: number
  totalMedicao: number
  totalMedicaoPaga: number
  saldoObra: number
  saldoConta: number
  percentualObra: number
  percentualFinanceiro: number
}

export interface FiltroObraPublica {
  numero?: number
  status?: StatusObra
  tipo?: TipoObra
  unidadeId?: number
  fornecedorId?: number
  paralisada?: boolean
}
