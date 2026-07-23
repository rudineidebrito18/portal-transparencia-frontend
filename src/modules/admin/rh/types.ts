import { Unidade } from '@/modules/admin/geral/types'

export interface Servidor {
  id: number
  cpf: string
  name: string
  cargo: string
  // GET /recursos-humanos/servidor só devolve {id, nome} aninhado, não a Unidade
  // completa (que ganhou campos novos em 2026-07-16) — importa o tipo canônico
  // de geral/types em vez de duplicar, mas só usa o subconjunto que o backend
  // realmente manda aqui.
  unidade?: Pick<Unidade, 'id' | 'nome'>
  dataAdmissao: string
  cargaHoraria: number
}

// Backend aceita `unidade: {id}` sozinho (sem `nome`) e resolve a FK — confirmado via curl.
export interface ServidorRequest {
  cpf: string
  name: string
  cargo: string
  unidade: { id: number }
  dataAdmissao: string
  cargaHoraria: number
}

export interface FiltroServidor {
  cpf?: string
  name?: string
  cargo?: string
  unidadeId?: number
  dataAdmissaoInicio?: string
  dataAdmissaoFim?: string
  cargaHoraria?: number
}

export interface Cargo {
  id: number
  cargo: string
  quantidade: number
  valorBruto: number
  valorDesconto: number
  valorLiquido: number
  media: number
}

export interface CargoRequest {
  cargo: string
  quantidade: number
  valorBruto: number
  valorDesconto: number
}

export interface Diaria {
  id: number
  dataInicio: string
  dataTermino: string
  beneficiario: string
  cargo: string
  destino: string
  motivo: string
  quantDiarias: number
  valorConcedido: number
}

export type DiariaRequest = Omit<Diaria, 'id'>

export interface FiltroDiaria {
  dataInicio?: string
  dataTermino?: string
  beneficiario?: string
  cargo?: string
  destino?: string
  motivo?: string
}

export interface FolhaPagamento {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  desconto: number
  salarioLiquido: number
}

// Sem PUT/DELETE no backend — POST cria uma nova entrada (não há edição/estorno).
export type FolhaPagamentoRequest = Omit<FolhaPagamento, 'id'>

export interface FolhaPagamentoServidor {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  descontos: number
  salarioLiquido: number
  nomeServidor: string
  cpfServidor: string
}

export interface Concurso {
  id: number
  descricao: string
  numero: number
  ano: number
  dataAbertura: string
  dataInscricoes: string
  dataTerminoInscricoes: string
  validate: string
  resumo: string
}

export type ConcursoRequest = Omit<Concurso, 'id'>

export interface FiltroConcurso {
  numero?: number
  ano?: number
  descricao?: string
  dataAberturaInicial?: string
  dataAberturaFinal?: string
}

export interface AnexoConcurso {
  id: number
  descricao: string
  data: string
  caminhoArquivo: string
}

export interface AnexoConcursoRequest {
  descricao: string
  data: string
}
