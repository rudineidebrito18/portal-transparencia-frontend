import { MdEmail, MdLocationOn, MdPeople, MdPhone, MdSchedule } from 'react-icons/md'

import Card from '@/components/ui/Card'
import InfoBlock from '@/components/ui/InfoBlock'
import { diarioOficialInfoService } from '../diario-oficial.service'

// Fase 4: Server Component — ver comentário em QuemSomosDiarioOficial.tsx (mesmo motivo/padrão).
export default async function ExpedienteDiarioOficial() {
  const info = await diarioOficialInfoService.buscarServidor()

  if (!info) return null

  return (
    <div className="space-y-6">
      {info.periodicidade && (
        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary mb-2">Periodicidade</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{info.periodicidade}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock label="Editor-chefe" value={info.editorChefe} icon={MdPeople} />
        <InfoBlock label="Redação" value={info.redacao} icon={MdSchedule} />
        <InfoBlock label="E-mail" value={info.email} icon={MdEmail} />
        <InfoBlock label="Telefone" value={info.telefone} icon={MdPhone} />
        <InfoBlock label="Endereço" value={info.endereco} icon={MdLocationOn} />
        <InfoBlock label="ISSN" value={info.issn} />
      </div>
    </div>
  )
}
