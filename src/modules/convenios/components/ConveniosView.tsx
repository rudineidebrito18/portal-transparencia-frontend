import AcordosFirmadosListView from './AcordosFirmadosListView'
import ConveniosTabs from './ConveniosTabs'
import TransferenciasRealizadasListView from './TransferenciasRealizadasListView'
import TransferenciasRecebidasListView from './TransferenciasRecebidasListView'
import { Aba } from '../types'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'transferencias-recebidas', label: 'Transferências Recebidas' },
  { aba: 'transferencias-realizadas', label: 'Transferências Realizadas' },
  { aba: 'acordos-firmados', label: 'Acordos Firmados pelo Órgão' }
]

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de DiarioOficialView (branch explícito por aba, já
// que cada sub-recurso precisa de searchParams como prop).
export default function ConveniosView({ searchParams }: Props) {
  const categoriaParam = typeof searchParams.categoria === 'string' ? searchParams.categoria : undefined
  const aba = CATEGORIAS.find(c => c.aba === categoriaParam)?.aba ?? CATEGORIAS[0].aba

  return (
    <div>
      <ConveniosTabs categorias={CATEGORIAS} abaAtiva={aba} />

      {aba === 'transferencias-recebidas' && <TransferenciasRecebidasListView searchParams={searchParams} />}
      {aba === 'transferencias-realizadas' && <TransferenciasRealizadasListView searchParams={searchParams} />}
      {aba === 'acordos-firmados' && <AcordosFirmadosListView searchParams={searchParams} />}
    </div>
  )
}
