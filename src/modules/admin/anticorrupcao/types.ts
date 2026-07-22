export interface EmpresaDividaAtiva {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  descricao: string
  data: string
  valor: number
  caminhoPdf?: string
}

export interface EmpresaDividaAtivaRequest {
  nome: string
  razaoSocial: string
  cnpj: string
  descricao: string
  data: string
  valor: number
}

export interface EmpresaInidonea {
  id: number
  empresa: string
  cnpj: string
  descricao: string
  status: string
  data: string
  caminhoPdf?: string
}

export interface EmpresaInidoneaRequest {
  empresa: string
  cnpj: string
  descricao: string
  status: string
  data: string
}
