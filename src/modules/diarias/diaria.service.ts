import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
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
  },

  // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<Diaria>> {
    return backendFetch<Page<Diaria>>('/diarias/buscar', { params })
  }
}
