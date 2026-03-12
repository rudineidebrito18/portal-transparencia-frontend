import { StatusLicitacao } from "@/interfaces/enums/StatusLicitacao"
import { TipoProcedimentoLicitacao } from "@/interfaces/enums/TipoProcedimentoLicitacao"
import { Licitacao } from "@/interfaces/licitacao/Licitacao"

export const licitacoesMock: Licitacao[] = [
  {
    id: 1,

    numeroInstrumento: "001",
    ano: 2025,
    numeroProcesso: "120/2025",

    dataPublicacao: "2025-01-10",
    dataSessao: "2025-01-20",
    dataAbertura: "2025-01-20",
    dataHomologacao: "2025-01-25",

    valorEstimado: 150000,
    valorTotalDespesa: 140000,
    valorDotacao: 160000,
    valorGlobalAdjudicado: 140000,

    tipoProcedimento: TipoProcedimentoLicitacao.PE,
    status: StatusLicitacao.FINALIZADO,

    tipoCriterio: "MENOR_PRECO",
    finalidade: "Aquisição de equipamentos de informática",
    naturezaDespesa: "Material Permanente",
    regimeExecucao: "Empreitada por preço global",
    tipoResultado: "Adjudicado",
    origemRecurso: "Recursos Próprios",
    sistemaEletronico: "ComprasNet",
    lei: "Lei 14.133/2021",
    unidade: "Secretaria de Administração",
    nomeAutoridade: "João da Silva",

    objeto:
      "Aquisição de computadores, monitores e periféricos para atender as necessidades da Secretaria Municipal de Administração.",

    covid: false,

    documentos: [],
    contratos: []
  },
  {
    id: 2,

    numeroInstrumento: "002",
    ano: 2025,
    numeroProcesso: "130/2025",

    dataPublicacao: "2025-02-01",
    dataSessao: "2025-02-10",
    dataAbertura: "2025-02-10",

    valorEstimado: 80000,
    valorDotacao: 90000,

    tipoProcedimento: TipoProcedimentoLicitacao.PE,
    status: StatusLicitacao.EM_ANDAMENTO,

    tipoCriterio: "MENOR_PRECO",
    finalidade: "Reforma de escola",
    naturezaDespesa: "Obras e Instalações",
    regimeExecucao: "Empreitada por preço unitário",
    origemRecurso: "FUNDEB",
    lei: "Lei 14.133/2021",
    unidade: "Secretaria de Educação",
    nomeAutoridade: "Maria Oliveira",

    objeto:
      "Contratação de empresa especializada para reforma e ampliação da Escola Municipal São José.",

    covid: false,

    documentos: [],
    contratos: []
  }
]