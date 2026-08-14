export interface EmpresaDividaAtiva {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  descricao: string
  data: string
  valor: number
  caminhoPdf: string
}

export interface EmpresaInidonea {
  id: number
  empresa: string
  cnpj: string
  descricao: string
  status: string
  data: string
  caminhoPdf: string
}

export interface RelatorioExecucaoOrcamentaria {
  id: number
  descricao: string
  bimestre: number
  ano: number
  caminhoPdf?: string
  caminhoWord?: string
  caminhoXls?: string
}

// Quadrimestral (art. 55 da LRF) — regra padrão pra municípios acima de 50 mil habitantes,
// que é o caso deste sistema (não modela a exceção semestral do art. 63).
export type PeriodoRgf = 'PRIMEIRO_QUADRIMESTRE' | 'SEGUNDO_QUADRIMESTRE' | 'TERCEIRO_QUADRIMESTRE'

export const LABEL_PERIODO_RGF: Record<PeriodoRgf, string> = {
  PRIMEIRO_QUADRIMESTRE: '1º Quadrimestre',
  SEGUNDO_QUADRIMESTRE: '2º Quadrimestre',
  TERCEIRO_QUADRIMESTRE: '3º Quadrimestre'
}

export interface RelatorioGestaoFiscal {
  id: number
  ano: number
  periodo: PeriodoRgf
  caminhoPdf?: string
  caminhoWord?: string
  caminhoXls?: string
}

export interface FiltroEmpresaDividaAtiva {
  nome?: string
  razaoSocial?: string
  cnpj?: string
  dataInicial?: string
  dataFinal?: string
}

export interface FiltroEmpresaInidonea {
  empresa?: string
  cnpj?: string
  status?: string
  dataInicial?: string
  dataFinal?: string
}

export interface FiltroRelatorioExecucaoOrcamentaria {
  ano?: number
  bimestre?: number
  descricao?: string
}

export interface FiltroRelatorioGestaoFiscal {
  ano?: number
  periodo?: PeriodoRgf
}
