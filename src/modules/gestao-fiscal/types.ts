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

export interface RelatorioGestaoFiscal {
  id: number
  ano: number
  periodo: string
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
  periodo?: string
}
