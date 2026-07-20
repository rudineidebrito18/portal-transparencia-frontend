'use client'

import Card from '@/components/ui/Card'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { REGISTRY_MODULOS_GENERICOS } from '@/modules/admin/genericos/registry'

export default function AdminDashboardPage() {
  const { usuario } = useAuth()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary">Olá, {usuario?.email}</h1>
        <p className="text-sm text-text-secondary/70">
          {isAdministrador(usuario) ? 'Administrador' : 'Gerente'} — Portal da Transparência
        </p>
      </div>

      <Card className="p-5">
        <p className="text-sm text-text-secondary">
          {REGISTRY_MODULOS_GENERICOS.length} módulos disponíveis pra gestão de conteúdo na barra
          lateral. Diário Oficial (fluxo de publicação/assinatura) e Anticorrupção ainda estão em
          construção — ver seção &quot;Em breve&quot;.
        </p>
      </Card>
    </div>
  )
}
