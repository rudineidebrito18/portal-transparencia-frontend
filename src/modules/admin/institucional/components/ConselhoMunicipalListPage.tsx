'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MdDeleteOutline, MdEdit } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { criarConselhoMunicipalService } from '@/modules/admin/institucional/conselhoMunicipal.service'
import { ConselhoMunicipal, ConselhoMunicipalRequest, TipoConselho } from '@/modules/conselho-municipal/types'
import { formatarData } from '@/utils/date'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

interface FormState {
  id: number | null
  descricao: string
  mandatoInicio: string
  mandatoFim: string
}

const FORM_VAZIO: FormState = { id: null, descricao: '', mandatoInicio: '', mandatoFim: '' }

interface Props {
  tipo: TipoConselho
  titulo: string
  basePath: string
}

export default function ConselhoMunicipalListPage({ tipo, titulo, basePath }: Props) {
  const { usuario } = useAuth()
  const service = useMemo(() => criarConselhoMunicipalService(tipo), [tipo])

  const [lista, setLista] = useState<ConselhoMunicipal[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    service
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carregar, [tipo])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: ConselhoMunicipal) {
    setErroForm(null)
    setForm({
      id: c.id,
      descricao: c.descricao ?? '',
      mandatoInicio: c.mandatoInicio ?? '',
      mandatoFim: c.mandatoFim ?? ''
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await service.excluir(idParaExcluir)
      setIdParaExcluir(null)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    if (form.mandatoInicio && form.mandatoFim && form.mandatoInicio > form.mandatoFim) {
      setErroForm('O início do mandato não pode ser depois do fim.')
      return
    }

    setSalvando(true)
    setErroForm(null)

    const dados: Omit<ConselhoMunicipalRequest, 'tipo'> = {
      descricao: form.descricao || null,
      mandatoInicio: form.mandatoInicio || null,
      mandatoFim: form.mandatoFim || null
    }

    try {
      if (form.id) {
        await service.atualizar(form.id, dados)
      } else {
        await service.criar(dados)
      }
      setForm(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-admin-text">{titulo}</h1>
          <p className="text-sm text-admin-text-muted mt-1">
            Cada registro é uma composição do Conselho (um mandato). Crie um novo quando o mandato mudar —
            os anteriores ficam preservados como histórico público.
          </p>
        </div>

        {podeCriar(usuario, 'institucional') && !form && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all whitespace-nowrap"
          >
            + Nova composição
          </button>
        )}
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar composição' : 'Nova composição'}</h2>

            <div>
              <label className={classeLabel} htmlFor="descricao">Descrição / atribuições</label>
              <textarea
                id="descricao"
                rows={3}
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="mandatoInicio">Início do mandato</label>
                <input
                  id="mandatoInicio"
                  type="date"
                  value={form.mandatoInicio}
                  onChange={e => setForm({ ...form, mandatoInicio: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="mandatoFim">Fim do mandato</label>
                <input
                  id="mandatoFim"
                  type="date"
                  min={form.mandatoInicio || undefined}
                  value={form.mandatoFim}
                  onChange={e => setForm({ ...form, mandatoFim: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            {form.id && (
              <p className="text-xs text-admin-text-faint">
                Membros se gerenciam na tela de detalhe (
                <Link href={`${basePath}/${form.id}`} className="text-admin-accent hover:underline">
                  ver detalhes
                </Link>
                ).
              </p>
            )}

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

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhuma composição cadastrada." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Mandato</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Membros</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text tabular-nums">
                      {formatarData(c.mandatoInicio ?? undefined)} — {c.mandatoFim ? formatarData(c.mandatoFim) : 'atual'}
                    </td>
                    <td className="p-3.5 text-admin-text-muted">{c.membros.length}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`${basePath}/${c.id}`}
                          className="px-2 py-1 rounded-md text-xs font-semibold text-admin-accent hover:underline"
                        >
                          Detalhes
                        </Link>
                        {podeEditar(usuario, 'institucional') && (
                          <button
                            onClick={() => abrirEdicao(c)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'institucional') && (
                          <button
                            onClick={() => setIdParaExcluir(c.id)}
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
        titulo="Excluir composição?"
        mensagem="Essa ação não pode ser desfeita e remove os membros cadastrados nela."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />
    </div>
  )
}
