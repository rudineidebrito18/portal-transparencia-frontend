import { InformacoesEsic } from '../types'

const INFORMACOES: InformacoesEsic = {
  id: 1,
  enderecoAtendimento: 'Av. Presidente Vargas, 100 - Centro, Lago dos Rodrigues - MA',
  horarioInicioManha: '08:00',
  horarioFimManha: '12:00',
  horarioInicioTarde: '13:00',
  horarioFimTarde: '17:00',
  telefone: '(99) 3333-4444',
  email: 'esic@lagodosrodrigues.ma.gov.br',
  nomeResponsavel: 'Controladoria Geral do Município',
  prazoRespostaDisponivel: 20,
  prazoRespostaBusca: 10
}

export const esicMock = {
  async buscarInformacoes(): Promise<InformacoesEsic> {
    return INFORMACOES
  }
}
