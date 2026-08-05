'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MdAccountCircle, MdEmail, MdLocationOn, MdPhone, MdSchedule } from 'react-icons/md'

import Card from '@/components/ui/Card'
import InfoBlock from '@/components/ui/InfoBlock'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { formatarData } from '@/utils/date'
import { Autoridade } from '../types'

interface Props {
  autoridade: Autoridade
}

const NOME_GABINETE = 'Gabinete do Prefeito'

// Autoridade não tem vínculo/FK com Unidade (confirmado com o backend) e não guarda
// endereço/horário de atendimento — busca a unidade "Gabinete do Prefeito" só pra
// completar esses 2 campos no card de contato. Se não achar, o card simplesmente
// omite os campos que dependeriam dela (degrada bem, não é dado obrigatório).
export default function AutoridadeView({ autoridade }: Props) {
  const [gabinete, setGabinete] = useState<Unidade | null>(null)

  useEffect(() => {
    secretariasService
      .listar({ nome: NOME_GABINETE })
      .then(lista => setGabinete(lista.find(u => u.nome === NOME_GABINETE) ?? null))
      .catch(() => {})
  }, [])

  const telefone = autoridade.telefone ?? gabinete?.telefone ?? undefined

  return (
    <div className="space-y-6">
      <Card className="p-6 flex flex-col md:flex-row gap-6" hoverable={false}>
        {autoridade.fotoUrl ? (
          <Image
            src={autoridade.fotoUrl}
            alt={autoridade.nome}
            width={128}
            height={128}
            className="w-32 h-32 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-32 h-32 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MdAccountCircle size={56} />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">
            {autoridade.nome}
            {autoridade.nomePopular && (
              <span className="font-normal text-text-secondary"> ({autoridade.nomePopular})</span>
            )}
          </h1>
          <p className="text-sm text-text-secondary/70 mt-1">{autoridade.cargo}</p>

          {(autoridade.dataInicioMandato || autoridade.dataFimMandato) && (
            <p className="text-xs text-text-secondary/60 mt-2">
              Mandato de {formatarData(autoridade.dataInicioMandato ?? undefined)} a{' '}
              {autoridade.dataFimMandato ? formatarData(autoridade.dataFimMandato) : 'o momento'}
            </p>
          )}
        </div>
      </Card>

      {autoridade.atribuicoes && (
        <Card className="p-6" hoverable={false}>
          <h2 className="text-sm font-bold text-primary mb-2">Atribuições</h2>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {autoridade.atribuicoes}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock label="E-mail" value={autoridade.email} icon={MdEmail} />
        <InfoBlock label="Telefone" value={telefone} icon={MdPhone} />
        {gabinete?.endereco && <InfoBlock label="Endereço do gabinete" value={gabinete.endereco} icon={MdLocationOn} />}
        {gabinete?.horarioAtendimento && <InfoBlock label="Horário de atendimento" value={gabinete.horarioAtendimento} icon={MdSchedule} />}
      </div>
    </div>
  )
}
