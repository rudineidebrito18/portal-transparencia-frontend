'use client'

import { useState } from 'react'
import { MdExpandLess, MdExpandMore, MdFolderOpen } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { Concurso } from '../types'
import ConcursoAnexos from './ConcursoAnexos'

interface Props {
  concurso: Concurso
}

export default function ConcursoCard({ concurso }: Props) {
  const [anexosAbertos, setAnexosAbertos] = useState(false)

  return (
    <Card className="p-5 flex flex-col gap-4">

      {/* HEADER */}
      <div>
        <h2 className="text-base font-bold text-primary leading-tight">
          {concurso.descricao}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mt-2">
          {concurso.resumo}
        </p>
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Abertura</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataAbertura)}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Início das Inscrições</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataInscricoes)}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Término das Inscrições</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataTerminoInscricoes)}</p>
        </div>

        {concurso.validate && (
          <div>
            <p className="text-[11px] uppercase text-text-secondary/50">Validade</p>
            <p className="font-semibold text-text-secondary">{formatarData(concurso.validate)}</p>
          </div>
        )}
      </div>

      {/* ANEXOS */}
      <div className="pt-3 border-t border-border/20">
        <button
          onClick={() => setAnexosAbertos(!anexosAbertos)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <MdFolderOpen size={18} />
          Anexos
          {anexosAbertos ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
        </button>

        {anexosAbertos && (
          <div className="mt-3">
            <ConcursoAnexos concursoId={concurso.id} />
          </div>
        )}
      </div>

    </Card>
  )
}
