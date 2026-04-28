import { StatusLicitacao } from "@/interfaces/enums/StatusLicitacao";
import { TipoProcedimentoLicitacao } from "@/interfaces/enums/TipoProcedimentoLicitacao";
import { DocumentoLicitacao } from "@/interfaces/licitacao/DocumentoLicitacao";
import { Licitacao } from "@/interfaces/licitacao/Licitacao";
import { fakerPT_BR as faker } from '@faker-js/faker';
import { gerarListaContratosMock } from "./contratoMock";

const gerarDocumentosMock = (quantidade: number): DocumentoLicitacao[] => {
  const tipos = ['Edital', 'Anexo', 'Ata de Reunião', 'Termo de Referência', 'Homologação', 'Contrato Assinado'];
  const assuntos = [
    'Documentação técnica para análise',
    'Publicação de resultado preliminar',
    'Abertura de certame licitatório',
    'Minuta do contrato administrativo',
    'Parecer jurídico de aprovação'
  ];

  return Array.from({ length: quantidade }, (_, i) => ({
    id: faker.number.int({ min: 1000, max: 9999 }),
    assunto: faker.helpers.arrayElement(assuntos),
    tipoDocumento: faker.helpers.arrayElement(tipos),
    dataEnvio: faker.date.recent().toISOString(), // Mantém formato ISO string
    caminhoPdf: `/arquivos/exemplo_${i + 1}.pdf`
  }));
};

const gerarLicitacoes = (quantidade: number): Licitacao[] => {
  return Array.from({ length: quantidade }, (_, index) => {
    const id = index + 1;

    faker.seed(id)
    return {
      id,
      numeroInstrumento: faker.string.numeric(3).padStart(3, '0'),
      ano: faker.helpers.arrayElement([2024, 2025]),
      numeroProcesso: `${faker.number.int({ min: 100, max: 999 })}/${2025}`,
      dataPublicacao: faker.date.recent().toISOString().split('T')[0],
      dataSessao: faker.date.future().toISOString().split('T')[0],
      dataAbertura: faker.date.future().toISOString().split('T')[0],
      valorEstimado: faker.number.float({ min: 5000, max: 1000000, multipleOf: 0.02 }),
      tipoProcedimento: faker.helpers.enumValue(TipoProcedimentoLicitacao),
      status: faker.helpers.enumValue(StatusLicitacao),
      tipoCriterio: "MENOR_PRECO",
      finalidade: faker.commerce.productName(),
      naturezaDespesa: "Material Permanente",
      regimeExecucao: "Empreitada por preço global",
      origemRecurso: faker.helpers.arrayElement(["Recursos Próprios", "FUNDEB", "Federal"]),
      lei: "Lei 14.133/2021",
      unidade: faker.company.name(),
      nomeAutoridade: faker.person.fullName(),
      objeto: faker.lorem.paragraph(1),
      covid: false,
      documentos: gerarDocumentosMock(3),
      contratos: gerarListaContratosMock(id)
    };
  });
};

export const licitacoesMock = gerarLicitacoes(100);