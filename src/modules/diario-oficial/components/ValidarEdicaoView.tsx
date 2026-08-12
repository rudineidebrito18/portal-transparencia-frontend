'use client'

import { useEffect, useState } from 'react'
import { MdVerifiedUser } from 'react-icons/md'

import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { validacaoEdicaoService } from '../diario-oficial.service'
import { ValidacaoPublicaDiario } from '../types'
import ResultadoValidacaoEdicao from './ResultadoValidacaoEdicao'

interface Props {
  numero: number
}

// Página dedicada de verificação de autenticidade — é o destino do QR Code impresso na
// última página de cada edição (app.diario.validacao.url-base + "/" + numeroEdicao).
export default function ValidarEdicaoView({ numero }: Props) {
  const [resultado, setResultado] = useState<ValidacaoPublicaDiario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    setCarregando(true)
    setErro(null)
    setResultado(null)

    validacaoEdicaoService
      .validar(numero)
      .then(dados => {
        if (ativo) setResultado(dados)
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível verificar essa edição.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [numero])

  if (carregando) {
    return <Skeleton className="h-64" />
  }

  if (erro) {
    return <ErrorState message={erro} />
  }

  if (!resultado) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-success/10 text-success">
          <MdVerifiedUser size={26} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Verificação da Edição Nº {resultado.numeroEdicao}
          </h2>
          <p className="text-sm text-text-secondary/70">
            Dados oficiais de autenticidade desta edição do Diário Oficial.
          </p>
        </div>
      </div>

      <ResultadoValidacaoEdicao resultado={resultado} />
    </div>
  )
}
