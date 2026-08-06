'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MdArrowBack } from 'react-icons/md'

import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'
import Skeleton from '@/components/ui/Skeleton'

function Conteudo() {
  const params = useSearchParams()
  const router = useRouter()
  const src = params.get('src')
  const titulo = params.get('titulo') ?? 'Documento'
  const origemLabel = params.get('origemLabel')
  const origemHref = params.get('origemHref')

  const breadcrumbItems = origemLabel && origemHref
    ? [{ label: origemLabel, href: origemHref }, { label: titulo }]
    : [{ label: titulo }]

  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} />

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-primary hover:underline mb-4"
      >
        <MdArrowBack size={16} />
        Voltar
      </button>

      {src ? (
        <PdfViewer src={src} titulo={titulo} />
      ) : (
        <p className="text-sm text-text-secondary/70">Nenhum documento informado.</p>
      )}
    </div>
  )
}

export default function DocumentoPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[80vh]" />}>
      <Conteudo />
    </Suspense>
  )
}
