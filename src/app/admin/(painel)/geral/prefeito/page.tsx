'use client'

import AutoridadeConfigPage from '@/modules/admin/geral/components/AutoridadeConfigPage'
import { prefeitoAdminService } from '@/modules/admin/geral/geral.service'

export default function PrefeitoAdminPage() {
  return (
    <AutoridadeConfigPage
      titulo="Perfil do Prefeito"
      cargoPadrao="Prefeito Municipal"
      service={prefeitoAdminService}
    />
  )
}
