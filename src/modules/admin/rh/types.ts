import { Unidade } from '@/modules/admin/geral/types'

export type StatusServidor = 'ATIVO' | 'DESLIGADO'

// Cargo de um servidor (1-N, migration V49): cada cargo tem unidade/carga horária/data de
// admissão próprios. Na resposta, `cargos` vem ordenado com o principal primeiro (ver
// ServidorMapper.toDto no backend) — o primeiro item é a referência da folha de pagamento.
// `unidade` é objeto completo no GET, mas o front só usa o subconjunto (mesmo padrão do
// antigo campo `unidade` do Servidor).
export interface ServidorCargo {
  id: number
  cargo: string
  codigoCargo?: string
  codigoOrgao?: string
  unidade?: Pick<Unidade, 'id' | 'nome'>
  dataAdmissao?: string
  cargaHoraria?: number
  ativo: boolean
  principal: boolean
}

// Request: `unidade` vem só com o id (mesmo padrão do antigo campo `unidade` do ServidorDto);
// `id` e `principal` são opcionais — sem `principal` marcado, o primeiro cargo da lista vira
// o principal no backend.
export interface ServidorCargoRequest {
  cargo: string
  codigoCargo?: string
  codigoOrgao?: string
  unidade: { id: number }
  dataAdmissao?: string
  cargaHoraria?: number
  ativo?: boolean
  principal?: boolean
}

export interface Servidor {
  id: number
  cpf: string
  name: string
  // Desligar preserva o histórico de folha (excluir o registro é bloqueado enquanto houver
  // folha lançada — 2026-08-13, ver ServidorServiceImpl.deleteServidor no backend).
  status: StatusServidor
  cargos: ServidorCargo[]
}

// PUT substitui a lista de cargos por inteiro pelos cargos enviados (orphanRemoval no backend).
export interface ServidorRequest {
  cpf: string
  name: string
  status?: StatusServidor
  cargos: ServidorCargoRequest[]
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

// Motivos de uma linha do CSV de importação de servidores não virar cadastro — espelha
// MotivoLinhaServidorIgnorada do backend.
export type MotivoLinhaServidorIgnorada =
  | 'CPF_INVALIDO'
  | 'DADOS_INCOMPLETOS'
  | 'DUPLICADO_NO_ARQUIVO'
  | 'JA_CADASTRADO'
  | 'UNIDADE_NAO_ENCONTRADA'
  | 'UNIDADE_AMBIGUA'

export interface LinhaServidorIgnorada {
  cpfInformado: string
  nomeInformado: string
  unidadeInformada: string
  motivo: MotivoLinhaServidorIgnorada
  detalhe?: string
}

export interface UnidadeMatchPreview {
  nomeInformado: string
  unidadeId: number | null
  unidadeNome: string | null
  motivo: 'UNIDADE_NAO_ENCONTRADA' | 'UNIDADE_AMBIGUA' | null
  candidatas: string[]
}

export interface ImportacaoServidorPreview {
  totalLinhas: number
  totalServidoresNovos: number
  totalLinhasIgnoradas: number
  unidadesComMatch: UnidadeMatchPreview[]
  unidadesSemMatch: UnidadeMatchPreview[]
}

export interface ImportacaoServidorResumo {
  id: number
  dataImportacao: string
  usuarioEmail: string
  nomeArquivo: string
  totalLinhas: number
  totalCadastrados: number
  totalIgnorados: number
}

export interface ImportacaoServidorDetalhe extends ImportacaoServidorResumo {
  linhasIgnoradas: LinhaServidorIgnorada[]
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
