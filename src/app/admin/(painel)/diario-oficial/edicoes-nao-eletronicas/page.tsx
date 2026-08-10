'use client'

import { FormEvent, useCallback, useState } from 'react'

import Link from 'next/link'
import { MdEdit, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { edicaoNaoEletronicaAdminService } from '@/modules/admin/diario-oficial/edicaoNaoEletronica.service'
import {
  EdicaoNaoEletronica,
  EdicaoNaoEletronicaRequest,
  FiltroEdicaoNaoEletronica,
  TipoEdicaoDiario,
  TipoEdicaoDiarioDescricao
} from '@/modules/admin/diario-oficial/types'
import { hrefDocumento } from '@/utils/documento'

interface FormState {
  id: number | null
  volume: string
  descricao: string
  data: string
  tipo: string
}

const FORM_VAZIO: FormState = { id: null, volume: '', descricao: '', data: '', tipo: TipoEdicaoDiario.EXECUTIVO }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function EdicoesNaoEletronicasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEdicaoNaoEletronica & { page?: number; size?: number; sort?: string }) => edicaoNaoEletronicaAdminService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EdicaoNaoEletronica,
    FiltroEdicaoNaoEletronica
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(item: EdicaoNaoEletronica) {
    setErroForm(null)
    setArquivo(null)
    setForm({ id: item.id, volume: item.volume, descricao: item.descricao, data: item.data, tipo: item.tipo })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await edicaoNaoEletronicaAdminService.excluir(idParaExcluir)
      setIdParaExcluir(null)
      recarregar()
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

    const dados: EdicaoNaoEletronicaRequest = { volume: form.volume, descricao: form.descricao, data: form.data, tipo: form.tipo }

    try {
      if (form.id) {
        await edicaoNaoEletronicaAdminService.atualizar(form.id, dados, arquivo)
      } else {
        if (!arquivo) throw new Error('Selecione um arquivo PDF.')
        await edicaoNaoEletronicaAdminService.criar(dados, arquivo)
      }

      setForm(null)
      recarregar()
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
          <h1 className="text-lg font-bold text-admin-text">Diário Oficial — Edições Não Eletrônicas</h1>
          <p className="text-sm text-admin-text-muted">Publicações físicas anteriores ao sistema eletrônico.</p>
        </div>

        {podeCriar(usuario, 'diario-oficial') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo registro
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Buscar por descrição..."
          defaultValue={filtros.descricao ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') setFiltros({ ...filtros, descricao: (e.target as HTMLInputElement).value })
          }}
          className={`${classeInput} flex-1 min-w-[200px]`}
        />
        <select
          value={filtros.tipo ?? ''}
          onChange={e => setFiltros({ ...filtros, tipo: e.target.value || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os tipos</option>
          {Object.values(TipoEdicaoDiario).map(t => (
            <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
          ))}
        </select>
        <input
          type="date"
          value={filtros.dataInicial ?? ''}
          onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          className={`${classeInput} w-auto`}
        />
        <input
          type="date"
          value={filtros.dataFinal ?? ''}
          onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          className={`${classeInput} w-auto`}
        />
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar registro' : 'Novo registro'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="volume">Volume</label>
                <input
                  id="volume"
                  required
                  placeholder="Ex: Vol. 2 - Nº 93 / 2021"
                  value={form.volume}
                  onChange={e => setForm({ ...form, volume: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="descricao">Descrição</label>
                <input
                  id="descricao"
                  required
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div>
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className={`${classeInput} w-auto`}
                >
                  {Object.values(TipoEdicaoDiario).map(t => (
                    <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={classeLabel} htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  required
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className={`${classeInput} w-auto`}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">
                Arquivo PDF {form.id && '(opcional — mantém o atual se vazio)'}
              </label>
              <input
                id="arquivo"
                type="file"
                accept="application/pdf"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:text-white
                  file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark"
              />
              {arquivo && <p className="text-xs text-admin-text-faint mt-1">Selecionado: {arquivo.name}</p>}
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

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum registro encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Volume</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text whitespace-nowrap">{item.volume}</td>
                    <td className="p-3.5 text-admin-text-muted">{item.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums whitespace-nowrap">{item.data}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-muted">
                        {TipoEdicaoDiarioDescricao[item.tipo as TipoEdicaoDiario] ?? item.tipo}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(item.caminhoArquivo, item.descricao, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'diario-oficial') && (
                          <button
                            onClick={() => abrirEdicao(item)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'diario-oficial') && (
                          <button
                            onClick={() => setIdParaExcluir(item.id)}
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

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir registro?"
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
