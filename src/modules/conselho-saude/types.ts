export enum TitularOuSuplente {
  TITULAR = 'TITULAR',
  SUPLENTE = 'SUPLENTE'
}

export const TitularOuSuplenteDescricao: Record<TitularOuSuplente, string> = {
  [TitularOuSuplente.TITULAR]: 'Titular',
  [TitularOuSuplente.SUPLENTE]: 'Suplente'
}

export enum TipoConselho {
  SAUDE = 'SAUDE',
  EDUCACAO = 'EDUCACAO'
}

export interface MembroConselho {
  id: number
  nome: string
  segmento: string | null
  funcao: string | null
  titularOuSuplente: TitularOuSuplente
}

export interface MembroConselhoRequest {
  nome: string
  segmento: string | null
  funcao: string | null
  titularOuSuplente: TitularOuSuplente
}

// membros vem embutido na resposta (GET /{id} e GET paginado) — backend não separa em
// duas chamadas, ver ConselhoMunicipalController.
export interface ConselhoMunicipal {
  id: number
  tipo: TipoConselho
  descricao: string | null
  mandatoInicio: string | null
  mandatoFim: string | null
  membros: MembroConselho[]
}

export interface ConselhoMunicipalRequest {
  tipo: TipoConselho
  descricao: string | null
  mandatoInicio: string | null
  mandatoFim: string | null
}
