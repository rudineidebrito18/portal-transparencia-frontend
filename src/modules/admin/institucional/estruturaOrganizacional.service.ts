import { api } from '@/services/api'

const BASE = '/institucional/estrutura-organizacional'

export interface EstruturaOrganizacional {
  id: number
  arquivoUrl: string
  dataAtualizacao: string | null
}

export const estruturaOrganizacionalService = {
  // 404 quando ainda não há arquivo cadastrado — chamador decide como tratar.
  buscar(): Promise<EstruturaOrganizacional> {
    return api.get<EstruturaOrganizacional>(BASE).then(r => r.data)
  },

  atualizar(arquivo: File): Promise<EstruturaOrganizacional> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    return api.put<EstruturaOrganizacional>(BASE, formData).then(r => r.data)
  }
}
