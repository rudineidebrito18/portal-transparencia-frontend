import { api } from '@/services/api'
import { FormularioOuvidoriaRequest, InformacoesOuvidoria } from './types'

export const ouvidoriaService = {
  buscarInformacoes(): Promise<InformacoesOuvidoria> {
    return api.get<InformacoesOuvidoria>('/ouvidoria/info').then(r => r.data)
  },

  enviarFormulario(dados: FormularioOuvidoriaRequest, arquivo?: File | null): Promise<void> {
    const formData = new FormData()
    formData.append('dto', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    if (arquivo) formData.append('arquivo', arquivo)

    return api
      .post('/ouvidoria/formulario', formData)
      .then(() => undefined)
  }
}
