import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { Diaria, FiltroDiaria } from './types'

type ListarParams = FiltroDiaria & {
  page?: number
  size?: number
  sort?: string
}

export const diariaService = {
  listar(params: ListarParams): Promise<Page<Diaria>> {
    return api
      .get<Page<Diaria>>('/diarias/buscar', { params })
      .then(response => response.data)
  }
}
