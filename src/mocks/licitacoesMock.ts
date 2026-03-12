import { Licitacao } from '@/interfaces/Licitacao'

export const licitacoesMock: Licitacao[] = [
  {
    id: '001',
    numero: '02/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO (Registro de preço)',
    objeto: 'Aquisição de materiais de informática',
    dataAbertura: '2025-04-20',
    dataSituacao: '2025-04-22',
    dataPublicacao: '2025-04-21',
    valorEstimado: 17000000,
    situacao: 'aberta',
  },
  {
    id: '002',
    numero: '03/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO',
    objeto: 'Aquisição de equipamentos de informática',
    dataAbertura: '2025-05-10',
    dataSituacao: '2025-05-12',
    dataPublicacao: '2025-05-09',
    valorEstimado: 500000,
    situacao: 'finalizada',
  }
]