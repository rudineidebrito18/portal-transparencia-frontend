import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { FiltroServidor, Servidor } from './types'

type ListarParams = FiltroServidor & {
  page?: number
  size?: number
  sort?: string
}

export const servidorService = {
  listar(params: ListarParams): Promise<Page<Servidor>> {
    return api
      .get<Page<Servidor>>('/recursos-humanos/servidor/buscar', { params })
      .then(response => response.data)
  },

  // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<Servidor>> {
    return backendFetch<Page<Servidor>>('/recursos-humanos/servidor/buscar', { params })
  },

  buscarPorId(id: number): Promise<Servidor> {
    return api
      .get<Servidor>(`/recursos-humanos/servidor/${id}`)
      .then(response => response.data)
  }
}
