'use client'

import { useTransferenciasRealizadas } from '../hooks/useConvenios'
import ConvenioListPanel from './ConvenioListPanel'

export default function TransferenciasRealizadasListView() {
  const resource = useTransferenciasRealizadas()

  return <ConvenioListPanel {...resource} emptyMessage="Nenhuma transferência voluntária realizada encontrada." />
}
