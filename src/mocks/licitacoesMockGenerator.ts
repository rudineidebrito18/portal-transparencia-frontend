import { StatusLicitacao } from '@/interfaces/enums/StatusLicitacao';
import { TipoProcedimentoLicitacao } from '@/interfaces/enums/TipoProcedimentoLicitacao';
import { Licitacao } from '@/interfaces/licitacao/Licitacao';
import { fakerPT_BR as faker } from '@faker-js/faker';

faker.seed(123);

const gerarLicitacao = (id: number): Licitacao => {
  const dataPublicacaoBase = faker.date.between({ from: '2025-01-01', to: '2025-12-31' });
  
  return {
    id,
    numeroInstrumento: faker.string.numeric(3),
    ano: 2025,
    numeroProcesso: `${faker.string.numeric(3)}/2025`,
    
    dataPublicacao: dataPublicacaoBase.toISOString().split('T')[0],
    
    dataSessao: faker.date.soon({ days: 15, refDate: dataPublicacaoBase }).toISOString().split('T')[0],
    dataAbertura: faker.date.soon({ days: 20, refDate: dataPublicacaoBase }).toISOString().split('T')[0],
    dataHomologacao: faker.date.soon({ days: 40, refDate: dataPublicacaoBase }).toISOString().split('T')[0],
    
    valorEstimado: Number(faker.commerce.price({ min: 1000, max: 50000 })),
    valorTotalDespesa: Number(faker.commerce.price({ min: 1000, max: 50000 })),
    valorDotacao: Number(faker.commerce.price({ min: 1000, max: 50000 })),
    valorGlobalAdjudicado: Number(faker.commerce.price({ min: 1000, max: 50000 })),
    
    tipoProcedimento: faker.helpers.arrayElement(Object.values(TipoProcedimentoLicitacao)),
    status: faker.helpers.arrayElement(Object.values(StatusLicitacao)),
    tipoCriterio: faker.helpers.arrayElement(['MENOR_PRECO', 'MAIOR_DESCONTO', 'TÉCNICO_E_PREÇO']),
    finalidade: faker.commerce.productName(),
    naturezaDespesa: faker.helpers.arrayElement(['Material Permanente', 'Obras e Instalações']),
    regimeExecucao: faker.helpers.arrayElement(['Empreitada por preço global', 'Empreitada por preço unitário']),
    tipoResultado: faker.helpers.arrayElement(['Adjudicado', 'Cancelado', 'Habilitado']),
    origemRecurso: faker.helpers.arrayElement(['Recursos Próprios', 'FUNDEB', 'Convênio']),
    sistemaEletronico: faker.helpers.arrayElement(['ComprasNet', 'Licitações.gov']),
    lei: 'Lei 14.133/2021',
    unidade: faker.company.name(),
    
    nomeAutoridade: faker.person.fullName(),
    
    objeto: faker.commerce.productDescription(),
    covid: faker.datatype.boolean(),
    documentos: [],
    contratos: []
  }
}

const gerarLicitacoes = (quantidade: number): Licitacao[] => {
  return Array.from({ length: quantidade }, (_, i) => gerarLicitacao(i + 1))
}

export const gerarMockPaginado = (page = 0, size = 10, total = 50) => {
  const todas = gerarLicitacoes(total)
  const start = page * size
  const end = start + size

  return {
    content: todas.slice(start, end),
    totalElements: total,
    totalPages: Math.ceil(total / size),
    pageNumber: page,
    pageSize: size
  }
}