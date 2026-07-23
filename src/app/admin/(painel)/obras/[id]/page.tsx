'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Fornecedor } from '@/modules/admin/geral/types'
import { obraService } from '@/modules/admin/obras/obra.service'
import { medicaoService } from '@/modules/admin/obras/medicao.service'
import { anexoObraService } from '@/modules/admin/obras/anexoObra.service'
import { artService } from '@/modules/admin/obras/art.service'
import {
  ObraPublica,
  Medicao,
  MedicaoRequest,
  AnexoObra,
  Art,
  TipoObraDescricao,
  StatusObraDescricao,
  StatusObraStyle
} from '@/modules/admin/obras/types'

function formatarMoeda(valor?: number | null) {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data?: string) {
  if (!data) return '—'
  const isoData = data.includes('T') ? data : `${data}T00:00:00`
  return new Date(isoData).toLocaleDateString('pt-BR')
}

function formatarDataHora(data?: string) {
  if (!data) return '—'
  const isoData = data.includes('T') ? data : `${data}T00:00:00`
  return new Date(isoData).toLocaleString('pt-BR')
}

type Aba = 'medicoes' | 'anexos' | 'arts'

const MEDICAO_VAZIA: MedicaoRequest = {
  numero: 1,
  dataInicio: '',
  dataFim: '',
  fornecedorId: 0,
  situacao: '',
  responsavelExecucao: '',
  responsavelFiscalizacao: '',
  responsavelPasta: '',
  percentual: 0,
  valor: 0
}

export default function ObraDetalheAdminPage() {
  const params = useParams<{ id: string }>()
  const obraId = Number(params.id)

  const [obra, setObra] = useState<ObraPublica | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregarObra() {
    setLoading(true)
    setErro(null)
    obraService
      .buscarPorId(obraId)
      .then(setObra)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregarObra, [obraId])

  const [aba, setAba] = useState<Aba>('medicoes')

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    fornecedoresService.listar({ size: 200, sort: 'nome,asc' }).then(p => setFornecedores(p.content)).catch(() => {})
  }, [])

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />
  if (!obra) return null

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/obras" className="text-sm text-primary hover:underline">
          &larr; Voltar para Obras
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-lg font-bold text-primary">Obra nº {obra.numero} — {obra.local}</h1>
            <p className="text-sm text-text-secondary/70">{obra.objeto}</p>
          </div>
          <div className="flex gap-1">
            <Badge className={StatusObraStyle[obra.status]}>{StatusObraDescricao[obra.status]}</Badge>
            {obra.paralisada && <Badge className="bg-error/10 text-error">Paralisada</Badge>}
          </div>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" hoverable={false}>
        <div>
          <p className="text-text-secondary/60 text-xs">Tipo</p>
          <p className="font-semibold">{TipoObraDescricao[obra.tipo]}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Unidade responsável</p>
          <p className="font-semibold">{obra.nomeUnidade}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Fornecedor responsável</p>
          <p className="font-semibold">{obra.nomeFornecedor}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Fonte de recursos</p>
          <p className="font-semibold">{obra.fonte}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Início</p>
          <p className="font-semibold">{formatarData(obra.dataInicio)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Previsão de término</p>
          <p className="font-semibold">{formatarData(obra.dataPrevistaTermino)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Término real</p>
          <p className="font-semibold">{formatarData(obra.dataTermino)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Última atualização</p>
          <p className="font-semibold">{formatarDataHora(obra.ultimaAtualizacao)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Valor total</p>
          <p className="font-semibold">{formatarMoeda(obra.valorTotal)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Total medido</p>
          <p className="font-semibold">{formatarMoeda(obra.totalMedicao)} ({obra.percentualObra?.toFixed(1) ?? 0}%)</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Total pago</p>
          <p className="font-semibold">{formatarMoeda(obra.totalMedicaoPaga)} ({obra.percentualFinanceiro?.toFixed(1) ?? 0}%)</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Saldo da obra / conta</p>
          <p className="font-semibold">{formatarMoeda(obra.saldoObra)} / {formatarMoeda(obra.saldoConta)}</p>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-border/30">
        {([
          ['medicoes', 'Medições'],
          ['anexos', 'Anexos'],
          ['arts', 'ART']
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              aba === valor ? 'border-primary text-primary' : 'border-transparent text-text-secondary/60 hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'medicoes' && <AbaMedicoes obraId={obraId} fornecedores={fornecedores} aoAtualizar={carregarObra} />}
      {aba === 'anexos' && <AbaAnexos obraId={obraId} />}
      {aba === 'arts' && <AbaArts obraId={obraId} />}
    </div>
  )
}

function AbaMedicoes({
  obraId,
  fornecedores,
  aoAtualizar
}: {
  obraId: number
  fornecedores: Fornecedor[]
  aoAtualizar: () => void
}) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Medicao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    medicaoService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [form, setForm] = useState<{ id: number | null } & MedicaoRequest | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm({ id: null, ...MEDICAO_VAZIA })
  }

  function abrirEdicao(m: Medicao) {
    setErroForm(null)
    const fornecedor = fornecedores.find(f => f.nome === m.fornecedorNome)
    setForm({
      id: m.id,
      numero: m.numero,
      dataInicio: m.dataInicio,
      dataFim: m.dataFim,
      fornecedorId: fornecedor?.id ?? 0,
      situacao: m.situacao,
      responsavelExecucao: m.responsavelExecucao,
      responsavelFiscalizacao: m.responsavelFiscalizacao,
      responsavelPasta: m.responsavelPasta,
      percentual: m.percentual,
      valor: m.valor
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta medição? Essa ação não pode ser desfeita.')) return
    try {
      await medicaoService.excluir(obraId, id)
      carregar()
      aoAtualizar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form

    try {
      if (id) {
        await medicaoService.atualizar(obraId, id, dados)
      } else {
        await medicaoService.criar(obraId, dados)
      }
      setForm(null)
      carregar()
      aoAtualizar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'obras-repasses') && !form && (
        <button
          onClick={abrirCriacao}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          + Nova medição
        </button>
      )}

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar medição' : 'Nova medição'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de início</label>
                <input
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de fim</label>
                <input
                  type="date"
                  required
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <select
                  required
                  value={form.fornecedorId || ''}
                  onChange={e => setForm({ ...form, fornecedorId: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Situação</label>
                <input
                  required
                  value={form.situacao}
                  onChange={e => setForm({ ...form, situacao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Responsável execução</label>
                <input
                  required
                  value={form.responsavelExecucao}
                  onChange={e => setForm({ ...form, responsavelExecucao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsável fiscalização</label>
                <input
                  required
                  value={form.responsavelFiscalizacao}
                  onChange={e => setForm({ ...form, responsavelFiscalizacao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsável pasta</label>
                <input
                  required
                  value={form.responsavelPasta}
                  onChange={e => setForm({ ...form, responsavelPasta: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Percentual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  required
                  value={form.percentual}
                  onChange={e => setForm({ ...form, percentual: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valor}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhuma medição registrada." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nº</th>
                <th className="p-3">Período</th>
                <th className="p-3">Fornecedor</th>
                <th className="p-3">Situação</th>
                <th className="p-3">% / Valor</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(m => (
                <tr key={m.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{m.numero}</td>
                  <td className="p-3">{formatarData(m.dataInicio)} — {formatarData(m.dataFim)}</td>
                  <td className="p-3">{m.fornecedorNome}</td>
                  <td className="p-3">{m.situacao}</td>
                  <td className="p-3">{m.percentual}% / {formatarMoeda(m.valor)}</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'obras-repasses') && (
                      <button onClick={() => abrirEdicao(m)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'obras-repasses') && (
                      <button onClick={() => excluir(m.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function AbaAnexos({ obraId }: { obraId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<AnexoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    anexoObraService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function excluir(id: number) {
    if (!confirm('Excluir este anexo? Essa ação não pode ser desfeita.')) return
    try {
      await anexoObraService.excluir(obraId, id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setEnviando(true)
    setErroForm(null)

    try {
      await anexoObraService.criar(obraId, { descricao, data }, arquivo)
      setDescricao('')
      setData('')
      setArquivo(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar anexo')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'obras-repasses') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo anexo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arquivo</label>
              <input
                type="file"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar anexo'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum anexo cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Data</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className="border-t border-border/20">
                  <td className="p-3">{a.descricao}</td>
                  <td className="p-3">{formatarData(a.data)}</td>
                  <td className="p-3">
                    <a
                      href={a.caminhoArquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Abrir
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'obras-repasses') && (
                      <button onClick={() => excluir(a.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function AbaArts({ obraId }: { obraId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Art[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    artService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [dataExpedicao, setDataExpedicao] = useState('')
  const [numero, setNumero] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [pdf, setPdf] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  // ART não é admin-only (foge do padrão do resto do módulo Obras) — usa grupo
  // 'padrao' pra criar/excluir em vez de 'obras-repasses', que forçaria admin.
  async function excluir(id: number) {
    if (!confirm('Excluir esta ART? Essa ação não pode ser desfeita.')) return
    try {
      await artService.excluir(obraId, id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pdf) return

    setEnviando(true)
    setErroForm(null)

    try {
      await artService.criar(obraId, { dataExpedicao, numero, responsavel, observacoes }, pdf)
      setDataExpedicao('')
      setNumero('')
      setResponsavel('')
      setObservacoes('')
      setPdf(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar ART')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'padrao') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Nova ART</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  required
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de expedição</label>
                <input
                  type="date"
                  required
                  value={dataExpedicao}
                  onChange={e => setDataExpedicao(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsável</label>
                <input
                  required
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PDF</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={e => setPdf(e.target.files?.[0] ?? null)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar ART'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhuma ART cadastrada." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Número</th>
                <th className="p-3">Data de expedição</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">PDF</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{a.numero}</td>
                  <td className="p-3">{formatarData(a.dataExpedicao)}</td>
                  <td className="p-3">{a.responsavel}</td>
                  <td className="p-3">
                    <a
                      href={a.caminhoPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Abrir
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'padrao') && (
                      <button onClick={() => excluir(a.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
