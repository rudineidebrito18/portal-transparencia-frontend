'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MdArrowBack } from 'react-icons/md'

import PdfViewer from '@/components/ui/PdfViewer'
import Skeleton from '@/components/ui/Skeleton'

function Conteudo() {
  const params = useSearchParams()
  const router = useRouter()
  const src = params.get('src')
  const titulo = params.get('titulo') ?? 'Documento'

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <MdArrowBack size={16} />
        Voltar
      </button>

      <h1 className="text-lg font-bold text-primary">{titulo}</h1>

      {src ? (
        <PdfViewer src={src} titulo={titulo} />
      ) : (
        <p className="text-sm text-text-secondary/70">Nenhum documento informado.</p>
      )}
    </div>
  )
}

export default function DocumentoAdminPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[80vh]" />}>
      <Conteudo />
    </Suspense>
  )
}
