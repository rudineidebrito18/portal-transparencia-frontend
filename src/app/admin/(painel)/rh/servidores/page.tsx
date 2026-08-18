'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { MdAdd, MdClose, MdEdit, MdDeleteOutline, MdStar } from 'react-icons/md'

import { useUrlState } from '@/hooks/useUrlState'
import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { servidorService } from '@/modules/admin/rh/servidor.service'
import { FiltroServidor, Servidor, ServidorRequest, StatusServidor } from '@/modules/admin/rh/types'
import ImportarServidoresTab from '@/modules/admin/rh/components/ImportarServidoresTab'
import HistoricoImportacoesServidorTab from '@/modules/admin/rh/components/HistoricoImportacoesServidorTab'

interface CargoFormState {
  cargo: string
  codigoCargo: string
  codigoOrgao: string
  unidadeId: number
  dataAdmissao: string
  cargaHoraria: number
  ativo: boolean
}

interface FormState {
  id: number | null
  cpf: string
  name: string
  status: StatusServidor
  cargos: CargoFormState[]
}

const CARGO_FORM_VAZIO: CargoFormState = {
  cargo: '',
  codigoCargo: '',
  codigoOrgao: '',
  unidadeId: 0,
  dataAdmissao: '',
  cargaHoraria: 40,
  ativo: true
}

const FORM_VAZIO: FormState = { id: null, cpf: '', name: '', status: 'ATIVO', cargos: [{ ...CARGO_FORM_VAZIO }] }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function ServidoresAdminPage() {
  const { usuario } = useAuth()

  const [aba, setAba] = useUrlState<'cadastro' | 'importar' | 'historico'>('categoria', 'cadastro')

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroServidor & { page?: number; size?: number; sort?: string }) => servidorService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Servidor,
    FiltroServidor
  >({ fetchFunction, initialSort: 'name,asc' })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [cargoParaExcluir, setCargoParaExcluir] = useState<{ servidorId: number; cargoId: number } | null>(null)
  const [excluindoCargo, setExcluindoCargo] = useState(false)

  const abas: { valor: 'cadastro' | 'importar' | 'historico'; label: string }[] = [
    { valor: 'cadastro', label: 'Cadastro' },
    { valor: 'importar', label: 'Importar Servidores' },
    { valor: 'historico', label: 'Histórico de importações' }
  ]

  function abrirCriacao() {
    setErroForm(null)
    setForm({ ...FORM_VAZIO, cargos: [{ ...CARGO_FORM_VAZIO }] })
  }

  function abrirEdicao(s: Servidor) {
    setErroForm(null)
    setForm({
      id: s.id,
      cpf: s.cpf,
      name: s.name,
      status: s.status,
      // GET já vem com o principal primeiro (ServidorMapper.toDto ordena assim).
      cargos: s.cargos.map(c => ({
        cargo: c.cargo,
        codigoCargo: c.codigoCargo ?? '',
        codigoOrgao: c.codigoOrgao ?? '',
        unidadeId: c.unidade?.id ?? 0,
        dataAdmissao: c.dataAdmissao ?? '',
        cargaHoraria: c.cargaHoraria ?? 40,
        ativo: c.ativo
      }))
    })
  }

  function adicionarCargo() {
    setForm(prev => (prev ? { ...prev, cargos: [...prev.cargos, { ...CARGO_FORM_VAZIO }] } : prev))
  }

  function removerCargo(indice: number) {
    setForm(prev =>
      prev && prev.cargos.length > 1
        ? { ...prev, cargos: prev.cargos.filter((_, i) => i !== indice) }
        : prev
    )
  }

  function atualizarCargo(indice: number, alteracoes: Partial<CargoFormState>) {
    setForm(prev =>
      prev
        ? { ...prev, cargos: prev.cargos.map((c, i) => (i === indice ? { ...c, ...alteracoes } : c)) }
        : prev
    )
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await servidorService.excluir(idParaExcluir)
      setIdParaExcluir(null)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function confirmarExclusaoCargo() {
    if (!cargoParaExcluir) return

    setExcluindoCargo(true)
    try {
      await servidorService.excluirCargo(cargoParaExcluir.servidorId, cargoParaExcluir.cargoId)
      setCargoParaExcluir(null)
      recarregar()
    } catch (e: unknown) {
      // Erro do backend é relevante aqui (cargo principal/último cargo bloqueados) —
      // o diálogo permanece aberto pra tentar de novo, mensagem exibida via alert
      // (padrão existente nessa página).
      alert(e instanceof Error ? e.message : 'Erro ao excluir cargo')
    } finally {
      setExcluindoCargo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const dados: ServidorRequest = {
      cpf: form.cpf,
      name: form.name,
      status: form.status,
      // Primeiro cargo da lista = principal (referência da folha de pagamento).
      cargos: form.cargos.map((c, i) => ({
        cargo: c.cargo,
        codigoCargo: c.codigoCargo || undefined,
        codigoOrgao: c.codigoOrgao || undefined,
        unidade: { id: c.unidadeId },
        dataAdmissao: c.dataAdmissao || undefined,
        cargaHoraria: c.cargaHoraria || undefined,
        ativo: c.ativo,
        principal: i === 0
      }))
    }

    try {
      if (form.id) {
        await servidorService.atualizar(form.id, dados)
      } else {
        await servidorService.criar(dados)
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
      <h1 className="text-lg font-bold text-admin-text">Servidores</h1>

      <div className="flex gap-2 border-b border-admin-border overflow-x-auto no-scrollbar">
        {abas.map(({ valor, label }) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition whitespace-nowrap ${aba === valor ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-faint'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'importar' && <ImportarServidoresTab onIrParaHistorico={() => setAba('historico')} />}
      {aba === 'historico' && <HistoricoImportacoesServidorTab />}

      {aba === 'cadastro' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-admin-text-faint">
              Cada servidor pode ter múltiplos cargos (1-N) — o primeiro cargo é o <strong className="text-admin-text">principal</strong>, referência para a folha de pagamento.
            </p>

            {podeCriar(usuario, 'rh') && (
              <button
                onClick={abrirCriacao}
                className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
              >
                + Novo servidor
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
            <input
              placeholder="CPF..."
              defaultValue={filtros.cpf ?? ''}
              onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cpf: (e.target as HTMLInputElement).value || undefined }) }}
              className={`${classeInput} w-auto`}
            />
            <input
              placeholder="Nome..."
              defaultValue={filtros.name ?? ''}
              onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, name: (e.target as HTMLInputElement).value || undefined }) }}
              className={`${classeInput} w-auto`}
            />
            <input
              placeholder="Cargo..."
              defaultValue={filtros.cargo ?? ''}
              onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
              className={`${classeInput} w-auto`}
            />
            <select
              value={filtros.unidadeId ?? ''}
              onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
              className={`${classeInput} w-auto`}
            >
              <option value="">Todas as unidades</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            <select
              value={filtros.status ?? ''}
              onChange={e => setFiltros({ ...filtros, status: (e.target.value || undefined) as StatusServidor | undefined })}
              className={`${classeInput} w-auto`}
            >
              <option value="">Ativos e desligados</option>
              <option value="ATIVO">Ativos</option>
              <option value="DESLIGADO">Desligados</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-admin-text-muted">
              <span>Admissão:</span>
              <input
                type="date"
                value={filtros.dataAdmissaoInicio ?? ''}
                onChange={e => setFiltros({ ...filtros, dataAdmissaoInicio: e.target.value || undefined })}
                className={`${classeInput} w-auto`}
              />
              <span>até</span>
              <input
                type="date"
                value={filtros.dataAdmissaoFim ?? ''}
                onChange={e => setFiltros({ ...filtros, dataAdmissaoFim: e.target.value || undefined })}
                className={`${classeInput} w-auto`}
              />
            </div>
          </div>

          {form && (
            <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar servidor' : 'Novo servidor'}</h2>
                    {form.id && (
                      <p className="text-xs text-admin-text-faint mt-1">
                        Ao salvar, a lista de cargos é <strong className="text-admin-accent">substituída por inteiro</strong> pelos cargos abaixo — cargos não listados são removidos.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={classeLabel} htmlFor="cpf">CPF</label>
                    <input
                      id="cpf"
                      required
                      value={form.cpf}
                      onChange={e => setForm({ ...form, cpf: e.target.value })}
                      className={classeInput}
                    />
                  </div>
                  <div>
                    <label className={classeLabel} htmlFor="name">Nome</label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className={classeInput}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-faint">
                      Cargos {form.cargos.length > 1 && <span className="text-admin-accent">({form.cargos.length})</span>}
                    </p>
                    <button
                      type="button"
                      onClick={adicionarCargo}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
                    >
                      <MdAdd size={14} />
                      Adicionar cargo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.cargos.map((c, indice) => (
                      <div key={indice} className="rounded-xl border border-admin-border bg-admin-surface p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-admin-accent/20 text-admin-accent">
                            <MdStar size={12} />
                            {indice === 0 ? 'Cargo principal' : `Cargo ${indice + 1}`}
                          </span>
                          {form.cargos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerCargo(indice)}
                              aria-label={`Remover cargo ${indice + 1}`}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-admin-text-faint hover:bg-admin-error-light hover:text-admin-error transition-colors text-xs"
                            >
                              <MdClose size={14} />
                              Remover
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-nome-${indice}`}>Cargo</label>
                            <input
                              id={`cargo-nome-${indice}`}
                              required
                              value={c.cargo}
                              onChange={e => atualizarCargo(indice, { cargo: e.target.value })}
                              placeholder="Ex: Professor Nível B"
                              className={classeInput}
                            />
                          </div>
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-unidade-${indice}`}>Unidade</label>
                            <select
                              id={`cargo-unidade-${indice}`}
                              required
                              value={c.unidadeId || ''}
                              onChange={e => atualizarCargo(indice, { unidadeId: Number(e.target.value) })}
                              className={classeInput}
                            >
                              <option value="" disabled>Selecione...</option>
                              {unidades.map(u => (
                                <option key={u.id} value={u.id}>{u.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-admissao-${indice}`}>Data de admissão</label>
                            <input
                              id={`cargo-admissao-${indice}`}
                              type="date"
                              value={c.dataAdmissao}
                              onChange={e => atualizarCargo(indice, { dataAdmissao: e.target.value })}
                              className={classeInput}
                            />
                          </div>
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-carga-${indice}`}>Carga horária semanal</label>
                            <input
                              id={`cargo-carga-${indice}`}
                              type="number"
                              min={1}
                              value={c.cargaHoraria}
                              onChange={e => atualizarCargo(indice, { cargaHoraria: Number(e.target.value) })}
                              className={classeInput}
                            />
                          </div>
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-codigo-${indice}`}>Código do cargo (RH)</label>
                            <input
                              id={`cargo-codigo-${indice}`}
                              value={c.codigoCargo}
                              onChange={e => atualizarCargo(indice, { codigoCargo: e.target.value })}
                              placeholder="Opcional — ex: 7904"
                              className={classeInput}
                            />
                          </div>
                          <div>
                            <label className={classeLabel} htmlFor={`cargo-orgao-${indice}`}>Código do órgão (RH)</label>
                            <input
                              id={`cargo-orgao-${indice}`}
                              value={c.codigoOrgao}
                              onChange={e => atualizarCargo(indice, { codigoOrgao: e.target.value })}
                              placeholder="Opcional — ex: 03"
                              className={classeInput}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm text-admin-text-muted cursor-pointer">
                              <input
                                type="checkbox"
                                checked={c.ativo}
                                onChange={e => atualizarCargo(indice, { ativo: e.target.checked })}
                                className="accent-admin-accent"
                              />
                              Cargo ativo (desmarcar preserva o histórico, como o status do servidor)
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={classeLabel} htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as StatusServidor })}
                    className={`${classeInput} md:w-60`}
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="DESLIGADO">Desligado</option>
                  </select>
                  <p className="text-xs text-admin-text-faint mt-1">
                    Desligar preserva o histórico de folha de pagamento — excluir o cadastro é bloqueado enquanto houver folha lançada.
                  </p>
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
          {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum servidor encontrado." />}

          {!loading && !erro && data.length > 0 && (
            <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border text-left">
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CPF</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargos</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(s => (
                      <tr key={s.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                        <td className="p-3.5 font-semibold text-admin-text">{s.name}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{s.cpf}</td>
                        <td className="p-3.5">
                          <ul className="space-y-1.5 min-w-52">
                            {s.cargos.map(c => (
                              <li key={c.id} className="flex items-center gap-2">
                                <span className="text-admin-text-muted">{c.cargo}</span>
                                {c.principal && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-admin-accent/20 text-admin-accent whitespace-nowrap">
                                    <MdStar size={10} />
                                    Principal
                                  </span>
                                )}
                                {c.unidade && (
                                  <span className="text-xs text-admin-text-faint truncate max-w-40" title={c.unidade.nome}>
                                    {c.unidade.nome}
                                  </span>
                                )}
                                {podeExcluir(usuario, 'rh') && !c.principal && s.cargos.length > 1 && (
                                  <button
                                    onClick={() => setCargoParaExcluir({ servidorId: s.id, cargoId: c.id })}
                                    aria-label={`Excluir cargo ${c.cargo}`}
                                    title="Excluir cargo"
                                    className="p-1 rounded text-admin-text-faint hover:bg-admin-error-light hover:text-admin-error transition-colors shrink-0"
                                  >
                                    <MdClose size={14} />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'DESLIGADO' ? 'bg-admin-error-light text-admin-error' : 'bg-admin-success-light text-admin-success'}`}>
                            {s.status === 'DESLIGADO' ? 'Desligado' : 'Ativo'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {podeEditar(usuario, 'rh') && (
                              <button
                                onClick={() => abrirEdicao(s)}
                                aria-label="Editar"
                                className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}
                            {podeExcluir(usuario, 'rh') && (
                              <button
                                onClick={() => setIdParaExcluir(s.id)}
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
            titulo="Excluir servidor?"
            mensagem="Essa ação não pode ser desfeita. Servidor com folha de pagamento lançada não pode ser excluído — desligue em vez disso."
            confirmarLabel="Excluir"
            perigoso
            carregando={excluindo}
            onConfirmar={confirmarExclusao}
            onCancelar={() => setIdParaExcluir(null)}
          />

          <ConfirmDialog
            aberto={cargoParaExcluir !== null}
            titulo="Excluir cargo?"
            mensagem="Remove esse cargo do servidor. O cargo principal e o último cargo restante são protegidos pelo sistema."
            confirmarLabel="Excluir"
            perigoso
            carregando={excluindoCargo}
            onConfirmar={confirmarExclusaoCargo}
            onCancelar={() => setCargoParaExcluir(null)}
          />
        </>
      )}
    </div>
  )
}
