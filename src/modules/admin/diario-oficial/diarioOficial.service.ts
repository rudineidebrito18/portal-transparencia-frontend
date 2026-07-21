import { api } from '@/services/api'
import { DiarioOficialInfo, DiarioOficialInfoRequest } from './types'

const BASE = '/diario-oficial'

function montarFormData(dados: DiarioOficialInfoRequest, brasao: File, logo: File): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  formData.append('brasao', brasao)
  formData.append('logo', logo)
  return formData
}

export const diarioOficialInfoService = {
  buscar(): Promise<DiarioOficialInfo> {
    return api.get<DiarioOficialInfo>(BASE).then(r => r.data)
  },

  // brasão e logo são partes obrigatórias no backend, sempre — não tem como manter os
  // atuais editando só os campos de texto (ver STATUS.md, lacunas de backend).
  atualizar(dados: DiarioOficialInfoRequest, brasao: File, logo: File): Promise<DiarioOficialInfo> {
    return api
      .put<DiarioOficialInfo>(BASE, montarFormData(dados, brasao, logo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  }
}
