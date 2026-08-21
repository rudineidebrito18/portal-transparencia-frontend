import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '@/modules/shared/types/Page'
import { DocumentoClassificadoSigilo, FormularioEsicPublico, FormularioEsicRequest, InformacoesEsic } from './types'

export const esicService = {
  buscarInformacoes(): Promise<InformacoesEsic> {
    return api.get<InformacoesEsic>('/esic/infos').then(r => r.data)
  },

  enviarFormulario(dados: FormularioEsicRequest): Promise<void> {
    return api.post('/esic/formulario', dados).then(() => undefined)
  },

  // Único endpoint de leitura público de /esic/formulario/** — backend filtra
  // grauSigilo=PUBLICO no servidor e nunca inclui nome/email (ver FormularioEsicPublicoDto).
  listarPublicas(params?: { page?: number; size?: number }): Promise<Page<FormularioEsicPublico>> {
    return api.get<Page<FormularioEsicPublico>>('/esic/formulario/publicas', { params }).then(r => r.data)
  },

  // Rol de Informações Classificadas (LAI, art. 30) — lista pequena por natureza, sem UI de paginação.
  listarDocumentosClassificadosSigilo(): Promise<DocumentoClassificadoSigilo[]> {
    return api
      .get<Page<DocumentoClassificadoSigilo>>('/esic/documentos-classificados-sigilo', { params: { size: 50 } })
      .then(r => r.data.content)
  },

  urlArquivoDocumentoClassificadoSigilo(id: number): string {
    return urlArquivoDocumento('esic/documentos-classificados-sigilo', id)
  }
}
