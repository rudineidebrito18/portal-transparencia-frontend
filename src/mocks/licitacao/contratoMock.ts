import { ContratoLicitacao } from "@/interfaces/licitacao/ContratoLicitacao";
import { fakerPT_BR as faker } from '@faker-js/faker';

export const gerarContratoMock = (id?: number): ContratoLicitacao => {
  const anoAtual = 2026;
  const dataAssinatura = faker.date.between({ 
    from: `${anoAtual}-01-01`, 
    to: `${anoAtual}-04-28` 
  });
  
  const dataInicio = new Date(dataAssinatura);
  dataInicio.setDate(dataInicio.getDate() + 5); 

  const dataTermino = new Date(dataInicio);
  dataTermino.setFullYear(dataTermino.getFullYear() + 1); 

  return {
    id: id || faker.number.int({ min: 1, max: 99999 }),
    numeroContrato: faker.number.int({ min: 1, max: 500 }),
    exercicio: anoAtual,
    
    fornecedor: faker.company.name().toUpperCase(),
    
    dataAssinatura: dataAssinatura.toISOString().split('T')[0],
    dataPublicacao: dataAssinatura.toISOString().split('T')[0],
    dataInicio: dataInicio.toISOString().split('T')[0],
    dataTermino: dataTermino.toISOString().split('T')[0],
    
    unidade: `SECRETARIA MUNICIPAL DE ${faker.commerce.department().toUpperCase()}`,
    gestorContrato: faker.person.fullName().toUpperCase(),
    meioPublicacao: "DIÁRIO OFICIAL DO MUNICÍPIO",
    
    valorContrato: Number(faker.commerce.price({ min: 10000, max: 1000000 })),
    
    objeto: faker.lorem.paragraph(2).toUpperCase(),
    
    status: faker.helpers.arrayElement(['EM_ANDAMENTO', 'CONCLUIDO', 'RESCINDIDO', 'SUSPENSO']),
    
    numeroLicitacao: `${faker.number.int({ min: 1, max: 100 }).toString().padStart(3, '0')}/${anoAtual - 1}`,

    documentoContratoLicitacaos: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, i) => ({
      id: faker.number.int({ min: 10000, max: 99999 }),
      nome: `DOCUMENTO_CONTRATUAL_0${i + 1}.PDF`,
      url: "#",
      assunto: faker.lorem.sentence().toUpperCase(),
      tipoDocumento: faker.helpers.arrayElement(['CONTRATO', 'EDITAL', 'ATA', 'TERMO']),
      dataEnvio: faker.date.past().toISOString().split('T')[0],
      caminhoPdf: `/documentos/contrato_${faker.string.uuid()}.pdf`
    })),
    
    aditivos: faker.helpers.maybe(() => [
      {
        id: faker.number.int({ min: 10000, max: 99999 }),
        numeroAditivo: 1,
        exercicio: anoAtual,
        descricao: "TERMO ADITIVO DE ACRÉSCIMO DE VALOR E PRORROGAÇÃO DE PRAZO.",
        valorAditivo: Number(faker.commerce.price({ min: 1000, max: 50000 })),
        dataAssinatura: faker.date.past().toISOString().split('T')[0],
        objeto: faker.lorem.paragraph(1).toUpperCase(),
        valor: Number(faker.commerce.price({ min: 1000, max: 50000 })),
        caminhoPdf: "/documentos/aditivo_1.pdf"
      }
    ], { probability: 0.3 }) || [] 
  };
};

export const gerarListaContratosMock = (quantidade: number = 2): ContratoLicitacao[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: quantidade }, (_, i) => gerarContratoMock(faker.number.int({ min: 1, max: 999999 })));
};