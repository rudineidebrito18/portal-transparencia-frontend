'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MdExpandLess, MdExpandMore, MdFolderOpen, MdVisibility } from 'react-icons/md'

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
        <p className="text-xs uppercase font-semibold text-text-muted">
          Concurso Nº {concurso.numero}/{concurso.ano}
        </p>
        <h2 className="text-base font-bold text-primary leading-tight mt-0.5">
          {concurso.descricao}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mt-2">
          {concurso.resumo}
        </p>
      </div>

      {/* GRID INFO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">Abertura</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataAbertura)}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Início das Inscrições</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataInscricoes)}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Término das Inscrições</p>
          <p className="font-semibold text-text-secondary">{formatarData(concurso.dataTerminoInscricoes)}</p>
        </div>

        {concurso.validate && (
          <div>
            <p className="text-xs uppercase text-text-muted">Validade</p>
            <p className="font-semibold text-text-secondary">{formatarData(concurso.validate)}</p>
          </div>
        )}
      </div>

      {/* ANEXOS + DETALHES */}
      <div className="pt-3 border-t border-border/20">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setAnexosAbertos(!anexosAbertos)}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <MdFolderOpen size={18} />
            Anexos
            {anexosAbertos ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>

          <Link
            href={`/concursos/${concurso.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <MdVisibility size={18} />
            Ver detalhes
          </Link>
        </div>

        {anexosAbertos && (
          <div className="mt-3">
            <ConcursoAnexos concursoId={concurso.id} />
          </div>
        )}
      </div>

    </Card>
  )
}
