import { notFound } from 'next/navigation'

import GenericCrudPage from '@/modules/admin/genericos/GenericCrudPage'
import { obterModuloGenerico } from '@/modules/admin/genericos/registry'

export default async function ModuloGenericoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = obterModuloGenerico(slug)

  if (!config) notFound()

  return <GenericCrudPage config={config} />
}
