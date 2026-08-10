'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MdArrowBack } from 'react-icons/md'

import PdfViewer from '@/components/ui/PdfViewer'

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
        className="flex items-center gap-1 text-sm text-admin-accent hover:underline"
      >
        <MdArrowBack size={16} />
        Voltar
      </button>

      <h1 className="text-lg font-bold text-admin-text">{titulo}</h1>

      {src ? (
        <PdfViewer src={src} titulo={titulo} />
      ) : (
        <p className="text-sm text-admin-text-faint">Nenhum documento informado.</p>
      )}
    </div>
  )
}

export default function DocumentoAdminPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-admin-border bg-admin-surface h-[80vh] animate-pulse" aria-hidden="true" />}>
      <Conteudo />
    </Suspense>
  )
}
