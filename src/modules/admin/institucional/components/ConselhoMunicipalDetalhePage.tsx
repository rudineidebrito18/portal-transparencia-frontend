'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MdDeleteOutline, MdEdit, MdGroups } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { criarConselhoMunicipalService, membroConselhoService } from '@/modules/admin/institucional/conselhoMunicipal.service'
import {
  ConselhoMunicipal,
  MembroConselho,
  MembroConselhoRequest,
  TipoConselho,
  TitularOuSuplente,
  TitularOuSuplenteDescricao
} from '@/modules/conselho-municipal/types'
import { formatarData } from '@/utils/date'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

interface Props {
  tipo: TipoConselho
  conselhoId: number
  basePath: string
  tituloLista: string
}

export default function ConselhoMunicipalDetalhePage({ tipo, conselhoId, basePath, tituloLista }: Props) {
  const service = useMemo(() => criarConselhoMunicipalService(tipo), [tipo])

  const [conselho, setConselho] = useState<ConselhoMunicipal | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    service
      .buscarPorId(conselhoId)
      .then(setConselho)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carregar, [conselhoId])

  if (loading) return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  if (erro) return <AdminErrorState message={erro} />
  if (!conselho) return null

  return (
    <div className="space-y-5">
      <div>
        <Link href={basePath} className="text-sm text-admin-accent hover:underline">
          &larr; Voltar para {tituloLista}
        </Link>
        <h1 className="text-lg font-bold text-admin-text mt-1">
          Mandato {formatarData(conselho.mandatoInicio ?? undefined)} — {conselho.mandatoFim ? formatarData(conselho.mandatoFim) : 'atual'}
        </h1>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
        <p className="text-admin-text-faint text-xs mb-1">Descrição / atribuições</p>
        <p className="text-sm text-admin-text whitespace-pre-line">{conselho.descricao || '—'}</p>
      </div>

      <AbaMembros conselhoId={conselhoId} membros={conselho.membros} aoAtualizar={carregar} />
    </div>
  )
}

interface MembroFormState {
  id: number | null
  nome: string
  segmento: string
  funcao: string
  titularOuSuplente: TitularOuSuplente
}

const MEMBRO_VAZIO: MembroFormState = { id: null, nome: '', segmento: '', funcao: '', titularOuSuplente: TitularOuSuplente.TITULAR }

function AbaMembros({
  conselhoId,
  membros,
  aoAtualizar
}: {
  conselhoId: number
  membros: MembroConselho[]
  aoAtualizar: () => void
}) {
  const { usuario } = useAuth()

  const [form, setForm] = useState<MembroFormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(MEMBRO_VAZIO)
  }

  function abrirEdicao(m: MembroConselho) {
    setErroForm(null)
    setForm({
      id: m.id,
      nome: m.nome,
      segmento: m.segmento ?? '',
      funcao: m.funcao ?? '',
      titularOuSuplente: m.titularOuSuplente
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await membroConselhoService.excluir(conselhoId, idParaExcluir)
      setIdParaExcluir(null)
      aoAtualizar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const dados: MembroConselhoRequest = {
      nome: form.nome,
      segmento: form.segmento || null,
      funcao: form.funcao || null,
      titularOuSuplente: form.titularOuSuplente
    }

    try {
      if (form.id) {
        await membroConselhoService.atualizar(conselhoId, form.id, dados)
      } else {
        await membroConselhoService.criar(conselhoId, dados)
      }
      setForm(null)
      aoAtualizar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-admin-text-faint">
          <MdGroups size={18} />
          Membros ({membros.length})
        </h2>

        {podeCriar(usuario, 'institucional') && !form && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo membro
          </button>
        )}
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar membro' : 'Novo membro'}</h3>

            <div>
              <label className={classeLabel} htmlFor="nome">Nome</label>
              <input
                id="nome"
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="segmento">Segmento representado</label>
                <input
                  id="segmento"
                  placeholder="Ex: Governo, Usuários, Trabalhadores"
                  value={form.segmento}
                  onChange={e => setForm({ ...form, segmento: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="funcao">Função no conselho</label>
                <input
                  id="funcao"
                  placeholder="Ex: Presidente"
                  value={form.funcao}
                  onChange={e => setForm({ ...form, funcao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="titularOuSuplente">Titular ou suplente</label>
              <select
                id="titularOuSuplente"
                value={form.titularOuSuplente}
                onChange={e => setForm({ ...form, titularOuSuplente: e.target.value as TitularOuSuplente })}
                className={classeInput}
              >
                {Object.values(TitularOuSuplente).map(valor => (
                  <option key={valor} value={valor}>{TitularOuSuplenteDescricao[valor]}</option>
                ))}
              </select>
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {membros.length === 0 && <AdminEmptyState message="Nenhum membro cadastrado." />}

      {membros.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Segmento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Função</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Situação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map(m => (
                  <tr key={m.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{m.nome}</td>
                    <td className="p-3.5 text-admin-text-muted">{m.segmento || '—'}</td>
                    <td className="p-3.5 text-admin-text-muted">{m.funcao || '—'}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        m.titularOuSuplente === TitularOuSuplente.TITULAR
                          ? 'bg-admin-info-light text-admin-info'
                          : 'bg-admin-surface-3 text-admin-text-muted'
                      }`}>
                        {TitularOuSuplenteDescricao[m.titularOuSuplente]}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'institucional') && (
                          <button
                            onClick={() => abrirEdicao(m)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'institucional') && (
                          <button
                            onClick={() => setIdParaExcluir(m.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir membro?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />
    </div>
  )
}
