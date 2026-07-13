import { InformacoesOuvidoria } from '../types'

const INFORMACOES: InformacoesOuvidoria = {
  id: 1,
  endereco: 'Av. Presidente Vargas, 100 - Centro, Lago dos Rodrigues - MA',
  horarioAtendimento: 'Segunda a sexta, das 08:00 às 12:00 e das 13:00 às 17:00',
  telefone: '(99) 3333-5555',
  email: 'ouvidoria@lagodosrodrigues.ma.gov.br',
  responsavel: 'Ouvidor-Geral do Município',
  prazos: 'Manifestações são respondidas em até 20 dias úteis, prorrogáveis por mais 10.',
  unidadeNome: 'Ouvidoria Municipal'
}

export const ouvidoriaMock = {
  async buscarInformacoes(): Promise<InformacoesOuvidoria> {
    return INFORMACOES
  }
}
