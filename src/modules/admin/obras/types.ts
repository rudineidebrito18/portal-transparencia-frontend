import { FiltroObraPublica, ObraPublica, TipoObra, StatusObra } from '@/modules/obras/types'

export type { ObraPublica, FiltroObraPublica }
export { TipoObra, StatusObra, TipoObraDescricao, StatusObraDescricao, StatusObraStyle } from '@/modules/obras/types'

export interface ObraRequest {
  numero: number
  dataInicio: string
  dataPrevistaTermino: string
  dataTermino?: string
  valorTotal: number
  tipo: TipoObra
  status: StatusObra
  paralisada: boolean
  unidadeId: number
  fornecedorId: number
  fonte: string
  local: string
  objeto: string
}

export interface Medicao {
  id: number
  numero: number
  dataInicio: string
  dataFim: string
  fornecedorNome: string
  situacao: string
  responsavelExecucao: string
  responsavelFiscalizacao: string
  responsavelPasta: string
  percentual: number
  valor: number
}

export interface MedicaoRequest {
  numero: number
  dataInicio: string
  dataFim: string
  fornecedorId: number
  situacao: string
  responsavelExecucao: string
  responsavelFiscalizacao: string
  responsavelPasta: string
  percentual: number
  valor: number
}

export interface AnexoObra {
  id: number
  descricao: string
  data: string
  caminhoArquivo: string
  obraPublicaId: number
}

export interface AnexoObraRequest {
  descricao: string
  data: string
}

export interface Art {
  id: number
  dataExpedicao: string
  numero: string
  responsavel: string
  observacoes: string
  caminhoPdf: string
}

export interface ArtRequest {
  dataExpedicao: string
  numero: string
  responsavel: string
  observacoes: string
}
