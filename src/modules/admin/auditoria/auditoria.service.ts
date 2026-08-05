import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { AuditLog, FiltroAuditoria } from './types'

type ListarParams = FiltroAuditoria & {
  page?: number
  size?: number
  sort?: string
}

// Cobertura completa desde 2026-08-05 — módulos bespoke (licitações, obras, RH
// específico, diário oficial etc.) agora geram registro igual aos módulos do
// padrão genérico. Contrato de resposta/filtro não mudou nessa rodada, só a
// cobertura no backend.
export const auditoriaService = {
  listar(params: ListarParams): Promise<Page<AuditLog>> {
    return api.get<Page<AuditLog>>('/admin/auditoria', { params }).then(r => r.data)
  }
}
