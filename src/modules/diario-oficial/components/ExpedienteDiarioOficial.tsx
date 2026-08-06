'use client'

import { MdEmail, MdLocationOn, MdPeople, MdPhone, MdSchedule } from 'react-icons/md'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import InfoBlock from '@/components/ui/InfoBlock'
import Skeleton from '@/components/ui/Skeleton'
import { useDiarioOficialInfo } from '../hooks/useDiarioOficialInfo'

export default function ExpedienteDiarioOficial() {
  const { data: info, loading, erro } = useDiarioOficialInfo()

  if (loading) return <Skeleton className="h-40" />
  if (erro) return <ErrorState message={erro} />
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
