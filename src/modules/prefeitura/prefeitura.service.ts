import { ApiError, api } from '@/services/api'
import { Autoridade, TipoAutoridade } from './types'

// GET devolve 404 antes da primeira configuração (PUT admin faz upsert) — mesmo padrão
// de esicInfoService/ouvidoriaInfoService. Sem mock: módulo criado depois da fase do
// painel admin, sempre chama o backend real (mesma convenção de Secretarias/Fornecedores).
function criarServicoAutoridade(tipo: TipoAutoridade) {
  return {
    buscar(): Promise<Autoridade | null> {
      return api.get<Autoridade>(`/geral/${tipo}`).then(
        r => r.data,
        (e: ApiError) => {
          if (e.status === 404) return null
          throw e
        }
      )
    }
  }
}

export const prefeitoService = criarServicoAutoridade('prefeito')
export const vicePrefeitoService = criarServicoAutoridade('vice-prefeito')
