'use client'

import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { MdCheckCircle, MdCancel, MdDownload } from 'react-icons/md'

import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { urlDownloadEdicao } from '../diario-oficial.service'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { ValidacaoPublicaDiario } from '../types'

const STATUS_INDEXACAO_LABEL: Record<ValidacaoPublicaDiario['statusIndexacao'], string> = {
  PENDENTE: 'Pendente',
  INDEXADO: 'Indexado (disponível na busca)',
  FALHOU: 'Falhou'
}

function hashParaHex(digest: ArrayBuffer): string {
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Compara o SHA-256 do arquivo selecionado com o hash oficial da edição, calculado no
// navegador (crypto.subtle, disponível em HTTPS/localhost) — verificação real de
// integridade, sem enviar o arquivo a nenhum servidor.
function VerificadorDeArquivo({ hashOficial }: { hashOficial: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [verificando, setVerificando] = useState(false)
  const [status, setStatus] = useState<'confere' | 'nao-confere' | null>(null)
  const [hashLocal, setHashLocal] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function verificarArquivo(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    if (typeof crypto === 'undefined' || !crypto.subtle) {
      setErro('Este navegador não permite o cálculo do hash do arquivo (é necessário HTTPS ou localhost).')
      return
    }

    setVerificando(true)
    setErro(null)
    setStatus(null)
    setHashLocal(null)

    try {
      const buffer = await arquivo.arrayBuffer()
      const digest = await crypto.subtle.digest('SHA-256', buffer)
      const hex = hashParaHex(digest)
      setHashLocal(hex)
      setStatus(hex.toLowerCase() === hashOficial.toLowerCase() ? 'confere' : 'nao-confere')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível calcular o hash do arquivo.')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="border-t border-border/30 pt-4">
      <p className="text-sm font-semibold text-text-secondary mb-2">Conferir o arquivo baixado</p>
      <p className="text-xs text-text-secondary/70 mb-3">
        Selecione o PDF que você baixou desta edição para comparar o hash dele com o hash oficial —
        se forem iguais, o documento está íntegro.
      </p>

      <form onSubmit={verificarArquivo} className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={e => {
            setArquivo(e.target.files?.[0] ?? null)
            setStatus(null)
            setHashLocal(null)
          }}
          className="text-sm text-text-secondary file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:cursor-pointer hover:file:bg-primary/20"
        />
        <button
          type="submit"
          disabled={verificando || !arquivo}
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
        >
          {verificando ? 'Calculando hash...' : 'Verificar arquivo'}
        </button>
      </form>

      {erro && <p className="text-sm text-error mt-3">{erro}</p>}

      {status === 'confere' && (
        <div className="mt-3 flex items-start gap-2 text-sm text-success">
          <MdCheckCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">O arquivo confere com o hash oficial — documento íntegro.</p>
            <p className="break-all text-xs text-text-secondary/70 mt-1">SHA-256: {hashLocal}</p>
          </div>
        </div>
      )}

      {status === 'nao-confere' && (
        <div className="mt-3 flex items-start gap-2 text-sm text-error">
          <MdCancel size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">O hash do arquivo não confere — o documento pode ter sido alterado.</p>
            <p className="break-all text-xs text-text-secondary/70 mt-1">Hash do arquivo: {hashLocal}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  resultado: ValidacaoPublicaDiario
}

// Resultado da validação (GET /edicoes/{numero}/validar), compartilhado entre o formulário
// manual da aba Ajuda e a página dedicada /diario/validar/{numero} (destino do QR Code).
export default function ResultadoValidacaoEdicao({ resultado }: Props) {
  return (
    <div className="bg-neutral-light rounded-xl p-4 space-y-3 text-sm">
      <div className="flex items-center gap-2 text-success font-semibold">
        <MdCheckCircle size={20} />
        {resultado.assinadoDigitalmente ? 'Documento assinado digitalmente' : 'Documento não assinado digitalmente'}
      </div>
      <p><strong>Edição:</strong> Nº {resultado.numeroEdicao}</p>
      <p><strong>Data de Publicação:</strong> {formatarData(resultado.dataPublicacao)}</p>
      <p><strong>Tipo:</strong> {TipoEdicaoDiarioDescricao[resultado.tipo as TipoEdicaoDiario] ?? resultado.tipo}</p>
      {resultado.dataAssinatura && (
        <p><strong>Assinado em:</strong> {new Date(resultado.dataAssinatura).toLocaleString('pt-BR')}</p>
      )}
      <p><strong>Indexação:</strong> {STATUS_INDEXACAO_LABEL[resultado.statusIndexacao]}</p>
      <p className="break-all"><strong>Hash SHA-256:</strong> <code className="text-xs">{resultado.hash}</code></p>

      <Link
        href={hrefDocumento(urlDownloadEdicao(resultado.numeroEdicao), `Edição Nº ${resultado.numeroEdicao}`, { origemLabel: 'Diário Oficial', origemHref: '/diario-oficial' })}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
      >
        <MdDownload size={18} />
        Baixar o PDF desta edição
      </Link>

      <VerificadorDeArquivo hashOficial={resultado.hash} />
    </div>
  )
}
