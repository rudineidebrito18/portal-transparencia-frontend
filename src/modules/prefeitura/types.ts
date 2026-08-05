export interface Autoridade {
  id: number
  nome: string
  nomePopular: string | null
  cargo: string
  fotoUrl: string | null
  atribuicoes: string
  email: string
  telefone: string | null
  dataInicioMandato: string | null
  dataFimMandato: string | null
}

export type TipoAutoridade = 'prefeito' | 'vice-prefeito'
