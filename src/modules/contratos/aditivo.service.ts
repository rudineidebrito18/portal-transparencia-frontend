import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { Aditivo } from './types'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

// Mesmo endpoint que contrato.service.ts usa pra listar aditivos de UM contrato
// (contratoLicitacaoId), só que aqui omitido de propósito — o backend já suporta listar
// todos os aditivos globalmente (parâmetro é opcional), confirmado via curl. Usado pela
// listagem pública global de Aditivos de Contratos (inspirada no site de referência).
export const aditivoGlobalService = {
  listarTodos(params: ListarParams): Promise<Page<Aditivo>> {
    return api
      .get<Page<Aditivo>>('/licitacoes/contratos/aditivos', { params })
      .then(response => response.data)
  }
}
