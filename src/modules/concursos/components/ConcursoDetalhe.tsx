import {
  MdCalendarToday,
  MdEventAvailable,
  MdEventBusy,
  MdSchool,
  MdTag,
  MdVerified
} from 'react-icons/md'

import InfoBlock from '@/components/ui/InfoBlock'
import { formatarData } from '@/utils/date'
import { Concurso } from '../types'
import ConcursoAnexos from './ConcursoAnexos'

interface Props {
  concurso: Concurso
}

export default function ConcursoDetalhe({ concurso }: Props) {
  return (
    <div className="bg-light border border-border/30 rounded-2xl shadow-md overflow-hidden mb-10">

      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-primary text-white">
            <MdSchool size={24} />
          </div>

          <div>
            <p className="text-sm text-text-secondary font-semibold">
              Concurso Nº {concurso.numero}/{concurso.ano}
            </p>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">
              {concurso.descricao}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">

        {concurso.resumo && (
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {concurso.resumo}
          </p>
        )}

        {/* GRID INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <InfoBlock label="Número/Ano" value={`${concurso.numero}/${concurso.ano}`} icon={MdTag} />
          <InfoBlock label="Abertura" value={formatarData(concurso.dataAbertura)} icon={MdCalendarToday} />
          <InfoBlock label="Início das Inscrições" value={formatarData(concurso.dataInscricoes)} icon={MdEventAvailable} />
          <InfoBlock label="Término das Inscrições" value={formatarData(concurso.dataTerminoInscricoes)} icon={MdEventBusy} />
          {concurso.validate && (
            <InfoBlock label="Validade" value={formatarData(concurso.validate)} icon={MdVerified} />
          )}
        </div>

        {/* ANEXOS */}
        <div className="pt-6 border-t border-border/20">
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-4">
            Anexos
          </h3>
          <ConcursoAnexos concursoId={concurso.id} />
        </div>

      </div>
    </div>
  )
}
