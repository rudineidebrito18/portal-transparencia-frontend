'use client'

import { useAcordosFirmados } from '../hooks/useConvenios'
import ConvenioListPanel from './ConvenioListPanel'

export default function AcordosFirmadosListView() {
  const resource = useAcordosFirmados()

  return <ConvenioListPanel {...resource} emptyMessage="Nenhum acordo firmado pelo órgão encontrado." />
}
