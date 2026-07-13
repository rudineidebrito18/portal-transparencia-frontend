'use client'

import { useTransferenciasRecebidas } from '../hooks/useConvenios'
import ConvenioListPanel from './ConvenioListPanel'

export default function TransferenciasRecebidasListView() {
  const resource = useTransferenciasRecebidas()

  return <ConvenioListPanel {...resource} emptyMessage="Nenhuma transferência voluntária recebida encontrada." />
}
