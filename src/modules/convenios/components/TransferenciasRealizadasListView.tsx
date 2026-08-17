'use client'

import { transferenciasRealizadasService } from '../convenio.service'
import { useTransferenciasRealizadas } from '../hooks/useConvenios'
import ConvenioListPanel from './ConvenioListPanel'

export default function TransferenciasRealizadasListView() {
  const resource = useTransferenciasRealizadas()

  return (
    <ConvenioListPanel
      {...resource}
      emptyMessage="Nenhuma transferência voluntária realizada encontrada."
      nomeBaseArquivo="convenios-transferencias-realizadas"
      urlArquivo={transferenciasRealizadasService.urlArquivo}
    />
  )
}
