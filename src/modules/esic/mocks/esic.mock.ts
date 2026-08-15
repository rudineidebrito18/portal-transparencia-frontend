import { Page } from '@/modules/shared/types/Page'
import { DocumentoClassificadoSigilo, FormularioEsicPublico, FormularioEsicRequest, InformacoesEsic } from '../types'

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
  },

  async enviarFormulario(dados: FormularioEsicRequest): Promise<void> {
    console.log('[mock] formulário e-SIC enviado:', dados)
  },

  async listarPublicas(): Promise<Page<FormularioEsicPublico>> {
    const itens: FormularioEsicPublico[] = [
      {
        protocolo: 'ESIC-000001',
        tipoSolicitacao: 'SOLICITACAO_INFORMACAO',
        solicitacao: 'Gostaria de saber o valor total gasto com merenda escolar em 2025.',
        resposta: 'O valor total investido em merenda escolar em 2025 foi de R$ 320.000,00, conforme execução orçamentária publicada no Portal da Transparência.',
        status: 'RESPONDIDA',
        criadoEm: '2026-06-10T09:30:00'
      }
    ]
    return { content: itens, totalPages: 1, totalElements: itens.length, number: 0, size: 10 }
  },

  async listarDocumentosClassificadosSigilo(): Promise<Page<DocumentoClassificadoSigilo>> {
    return { content: [], totalPages: 1, totalElements: 0, number: 0, size: 10 }
  }
}
