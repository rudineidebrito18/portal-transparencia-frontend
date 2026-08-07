import { api } from '@/services/api'
import { ouvidoriaMock } from './mocks/ouvidoria.mock'
import { FormularioOuvidoriaRequest, InformacoesOuvidoria } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const ouvidoriaService = {
  buscarInformacoes(): Promise<InformacoesOuvidoria> {
    if (USE_MOCK) return ouvidoriaMock.buscarInformacoes()

    return api.get<InformacoesOuvidoria>('/ouvidoria/info').then(r => r.data)
  },

  enviarFormulario(dados: FormularioOuvidoriaRequest, arquivo?: File | null): Promise<void> {
    if (USE_MOCK) return ouvidoriaMock.enviarFormulario(dados, arquivo)

    const formData = new FormData()
    formData.append('dto', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    if (arquivo) formData.append('arquivo', arquivo)

    return api
      .post('/ouvidoria/formulario', formData)
      .then(() => undefined)
  }
}
