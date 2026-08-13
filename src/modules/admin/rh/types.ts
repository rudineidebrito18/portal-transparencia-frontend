import { Unidade } from '@/modules/admin/geral/types'

export type StatusServidor = 'ATIVO' | 'DESLIGADO'

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
  // Desligar preserva o histórico de folha (excluir o registro é bloqueado enquanto houver
  // folha lançada — 2026-08-13, ver ServidorServiceImpl.deleteServidor no backend).
  status: StatusServidor
}

// Backend aceita `unidade: {id}` sozinho (sem `nome`) e resolve a FK — confirmado via curl.
export interface ServidorRequest {
  cpf: string
  name: string
  cargo: string
  unidade: { id: number }
  dataAdmissao: string
  cargaHoraria: number
  status: StatusServidor
}

export interface FiltroServidor {
  cpf?: string
  name?: string
  cargo?: string
  unidadeId?: number
  dataAdmissaoInicio?: string
  dataAdmissaoFim?: string
  cargaHoraria?: number
  status?: StatusServidor
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

export interface FiltroCargo {
  cargo?: string
  valorBrutoMin?: number
  valorBrutoMax?: number
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
  unidadeId?: number
  unidadeNome?: string
}

export interface DiariaRequest {
  dataInicio: string
  dataTermino: string
  beneficiario: string
  cargo: string
  destino: string
  motivo: string
  quantDiarias: number
  valorConcedido: number
  unidadeId?: number
}

export interface FiltroDiaria {
  dataInicio?: string
  dataTermino?: string
  beneficiario?: string
  cargo?: string
  destino?: string
  motivo?: string
  unidadeId?: number
}

export interface FolhaPagamento {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  desconto: number
  salarioLiquido: number
}

// PUT/DELETE existem (admin-only) — ver folha.service.ts atualizar()/excluir().
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
  cargo?: string
  unidadeNome?: string
  cargaHoraria?: number
  dataAdmissao?: string
}

export interface LinhaIgnorada {
  cpfInformado: string
  nomeInformado: string
  motivo: 'SERVIDOR_NAO_CADASTRADO' | 'DUPLICADO'
}

export interface ImportacaoFolhaResumo {
  id: number
  mes: number
  ano: number
  dataImportacao: string
  usuarioEmail: string
  nomeArquivo: string
  totalLinhas: number
  totalLancados: number
  totalIgnorados: number
}

export interface ImportacaoFolhaDetalhe extends ImportacaoFolhaResumo {
  linhasIgnoradas: LinhaIgnorada[]
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
