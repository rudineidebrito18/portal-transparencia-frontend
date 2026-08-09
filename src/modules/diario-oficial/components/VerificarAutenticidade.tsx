'use client'

import { FormEvent, useState } from 'react'
import { MdCheckCircle, MdSearch } from 'react-icons/md'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import { formatarData } from '@/utils/date'
import { validacaoEdicaoService } from '../diario-oficial.service'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { ValidacaoPublicaDiario } from '../types'

const STATUS_INDEXACAO_LABEL: Record<ValidacaoPublicaDiario['statusIndexacao'], string> = {
  PENDENTE: 'Pendente',
  INDEXADO: 'Indexado (disponível na busca)',
  FALHOU: 'Falhou'
}

// Mesmo endpoint que o QR Code impresso na última página de cada edição aponta (GET
// /edicoes/{numero}/validar, público) — aqui dá pra conferir manualmente informando o
// número da edição, sem precisar escanear o código.
export default function VerificarAutenticidade() {
  const [numeroEdicao, setNumeroEdicao] = useState('')
  const [resultado, setResultado] = useState<ValidacaoPublicaDiario | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!numeroEdicao) return

    setCarregando(true)
    setErro(null)
    setResultado(null)

    try {
      const dados = await validacaoEdicaoService.validar(Number(numeroEdicao))
      setResultado(dados)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível verificar essa edição.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Card className="p-6" hoverable={false}>
      <h2 className="text-base font-bold text-primary mb-1">Verificar autenticidade de uma edição</h2>
      <p className="text-sm text-text-secondary/70 mb-4">
        Informe o número da edição para conferir a assinatura digital e a integridade do documento
        — o mesmo resultado do QR Code impresso na última página do PDF.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-4">
        <input
          type="number"
          required
          value={numeroEdicao}
          onChange={e => setNumeroEdicao(e.target.value)}
          placeholder="Número da edição"
          className="border border-border/30 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all"
        />
        <button
          type="submit"
          disabled={carregando}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
        >
          <MdSearch size={18} />
          {carregando ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      {erro && <ErrorState message={erro} />}

      {resultado && (
        <div className="bg-neutral-light rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-success font-semibold">
            <MdCheckCircle size={20} />
            {resultado.assinadoDigitalmente ? 'Documento assinado digitalmente' : 'Documento não assinado digitalmente'}
          </div>
          <p><strong>Edição:</strong> Nº {resultado.numeroEdicao}</p>
          <p><strong>Publicado em:</strong> {formatarData(resultado.dataPublicacao)}</p>
          <p><strong>Tipo:</strong> {TipoEdicaoDiarioDescricao[resultado.tipo as TipoEdicaoDiario] ?? resultado.tipo}</p>
          {resultado.dataAssinatura && (
            <p><strong>Assinado em:</strong> {new Date(resultado.dataAssinatura).toLocaleString('pt-BR')}</p>
          )}
          <p><strong>Indexação:</strong> {STATUS_INDEXACAO_LABEL[resultado.statusIndexacao]}</p>
          <p className="break-all"><strong>Hash SHA-256:</strong> <code className="text-xs">{resultado.hash}</code></p>
        </div>
      )}
    </Card>
  )
}
