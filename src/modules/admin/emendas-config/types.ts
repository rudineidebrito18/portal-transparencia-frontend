export interface EmendaMunicipioConfig {
  id: number
  municipioNome: string
  municipioUf: string
  municipioCnpj: string
  atualizadoEm: string
}

export interface EmendaMunicipioConfigRequest {
  municipioNome: string
  municipioUf: string
  municipioCnpj: string
}
