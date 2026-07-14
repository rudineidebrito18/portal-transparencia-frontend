'use client'

import { MdDescription, MdFileDownload } from 'react-icons/md'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatarData } from '@/utils/date'
import { concursoService } from '../concurso.service'

interface Props {
  concursoId: number
}

// Só é montado quando o card expande — evita buscar anexos de todos os concursos
// de uma vez (o backend não retorna anexos junto da listagem principal).
export default function ConcursoAnexos({ concursoId }: Props) {
  const { data: anexos, loading, erro } = useAsyncData(
    () => concursoService.listarAnexos(concursoId),
    [concursoId],
    []
  )

  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  if (anexos.length === 0) return <EmptyState message="Nenhum anexo disponível." />

  return (
    <div className="space-y-2">
      {anexos.map(anexo => (
        <Card key={anexo.id} className="flex items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MdDescription size={16} />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-secondary">
                {anexo.descricao}
              </span>
              <span className="text-xs text-text-secondary/70">
                {formatarData(anexo.data)}
              </span>
            </div>
          </div>

          <a
            href={anexo.caminhoArquivo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
          >
            <MdFileDownload size={16} />
            Baixar
          </a>
        </Card>
      ))}
    </div>
  )
}
