export enum TitularOuSuplente {
  TITULAR = 'TITULAR',
  SUPLENTE = 'SUPLENTE'
}

export const TitularOuSuplenteDescricao: Record<TitularOuSuplente, string> = {
  [TitularOuSuplente.TITULAR]: 'Titular',
  [TitularOuSuplente.SUPLENTE]: 'Suplente'
}

// Mesma entidade/tabela no backend pros 3 — conselhos são pequenos e têm exatamente o
// mesmo formato, só o domínio (tipo) muda (item 28 do backlog). São órgãos legalmente
// distintos (composições de membros diferentes), por isso cada um tem sua própria
// página/rota pública e admin — não aparecem misturados em lugar nenhum.
export enum TipoConselho {
  SAUDE = 'SAUDE',
  EDUCACAO = 'EDUCACAO',
  ASSISTENCIA_SOCIAL = 'ASSISTENCIA_SOCIAL'
}

export const TipoConselhoDescricao: Record<TipoConselho, string> = {
  [TipoConselho.SAUDE]: 'Conselho Municipal de Saúde',
  [TipoConselho.EDUCACAO]: 'Conselho Municipal de Educação',
  [TipoConselho.ASSISTENCIA_SOCIAL]: 'Conselho Municipal de Assistência Social'
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
