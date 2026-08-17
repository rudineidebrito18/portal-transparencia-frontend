import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '@/modules/shared/types/Page'
import { esicMock } from './mocks/esic.mock'
import { DocumentoClassificadoSigilo, FormularioEsicPublico, FormularioEsicRequest, InformacoesEsic } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const esicService = {
  buscarInformacoes(): Promise<InformacoesEsic> {
    if (USE_MOCK) return esicMock.buscarInformacoes()

    return api.get<InformacoesEsic>('/esic/infos').then(r => r.data)
  },

  enviarFormulario(dados: FormularioEsicRequest): Promise<void> {
    if (USE_MOCK) return esicMock.enviarFormulario(dados)

    return api.post('/esic/formulario', dados).then(() => undefined)
  },

  // Único endpoint de leitura público de /esic/formulario/** — backend filtra
  // grauSigilo=PUBLICO no servidor e nunca inclui nome/email (ver FormularioEsicPublicoDto).
  listarPublicas(params?: { page?: number; size?: number }): Promise<Page<FormularioEsicPublico>> {
    if (USE_MOCK) return esicMock.listarPublicas()

    return api.get<Page<FormularioEsicPublico>>('/esic/formulario/publicas', { params }).then(r => r.data)
  },

  // Rol de Informações Classificadas (LAI, art. 30) — lista pequena por natureza, sem UI de paginação.
  listarDocumentosClassificadosSigilo(): Promise<DocumentoClassificadoSigilo[]> {
    if (USE_MOCK) return esicMock.listarDocumentosClassificadosSigilo().then(p => p.content)

    return api
      .get<Page<DocumentoClassificadoSigilo>>('/esic/documentos-classificados-sigilo', { params: { size: 50 } })
      .then(r => r.data.content)
  },

  urlArquivoDocumentoClassificadoSigilo(id: number): string {
    return urlArquivoDocumento('esic/documentos-classificados-sigilo', id)
  }
}
