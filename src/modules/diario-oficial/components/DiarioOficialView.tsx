import AjudaDiarioOficial from './AjudaDiarioOficial'
import DiarioOficialTabs from './DiarioOficialTabs'
import EdicoesTab from './EdicoesTab'
import EdicoesNaoEletronicasListView from './EdicoesNaoEletronicasListView'
import ExpedienteDiarioOficial from './ExpedienteDiarioOficial'
import QuemSomosDiarioOficial from './QuemSomosDiarioOficial'
import LegislacaoDiarioOficialListView from '../legislacao/components/LegislacaoDiarioOficialListView'
import { Aba } from '../types'

const CATEGORIAS: { aba: Aba; label: string }[] = [
  { aba: 'edicoes', label: 'Edições' },
  { aba: 'legislacao', label: 'Legislação' },
  { aba: 'nao-eletronicas', label: 'Edições Não Eletrônicas' },
  { aba: 'quem-somos', label: 'Quem Somos' },
  { aba: 'expediente', label: 'Expediente' },
  { aba: 'ajuda', label: 'Ajuda' }
]

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4 (parcial): Server Component — antes era 100% client (useUrlState escolhendo qual
// ComponentType renderizar de um Record<Aba, ComponentType> uniforme). Isso parou de funcionar
// quando a aba "edicoes" passou a precisar de searchParams como prop e as outras não — em vez
// de forçar uma assinatura uniforme, virou um branch explícito por aba. "legislacao" e
// "nao-eletronicas" continuam client (fora do escopo desta migração, ver plano de arquitetura).
export default function DiarioOficialView({ searchParams }: Props) {
  const categoriaParam = typeof searchParams.categoria === 'string' ? searchParams.categoria : undefined
  const aba = CATEGORIAS.find(c => c.aba === categoriaParam)?.aba ?? CATEGORIAS[0].aba

  return (
    <div>
      <DiarioOficialTabs categorias={CATEGORIAS} abaAtiva={aba} />

      {aba === 'edicoes' && <EdicoesTab searchParams={searchParams} />}
      {aba === 'legislacao' && <LegislacaoDiarioOficialListView />}
      {aba === 'nao-eletronicas' && <EdicoesNaoEletronicasListView />}
      {aba === 'quem-somos' && <QuemSomosDiarioOficial />}
      {aba === 'expediente' && <ExpedienteDiarioOficial />}
      {aba === 'ajuda' && <AjudaDiarioOficial />}
    </div>
  )
}
