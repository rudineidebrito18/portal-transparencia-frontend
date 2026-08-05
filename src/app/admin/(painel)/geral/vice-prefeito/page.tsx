'use client'

import AutoridadeConfigPage from '@/modules/admin/geral/components/AutoridadeConfigPage'
import { vicePrefeitoAdminService } from '@/modules/admin/geral/geral.service'

export default function VicePrefeitoAdminPage() {
  return (
    <AutoridadeConfigPage
      titulo="Perfil do Vice-Prefeito"
      cargoPadrao="Vice-Prefeito Municipal"
      service={vicePrefeitoAdminService}
    />
  )
}
