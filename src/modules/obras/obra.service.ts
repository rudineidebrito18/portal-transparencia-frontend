import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { Page } from '@/modules/shared/types/Page'
import { FiltroObraPublica, ObraPublica } from './types'

type ListarParams = FiltroObraPublica & { page?: number; size?: number; sort?: string }

export const obraService = {
  listar(params: ListarParams): Promise<Page<ObraPublica>> {
    return api.get<Page<ObraPublica>>('/obras/filtro', { params }).then(r => r.data)
  },

  // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<ObraPublica>> {
    return backendFetch<Page<ObraPublica>>('/obras/filtro', { params })
  }
}
