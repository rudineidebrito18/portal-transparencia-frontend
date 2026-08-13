'use client'

import { FormEvent, useEffect, useState } from 'react'
import { MdDelete, MdEdit } from 'react-icons/md'

import { useUrlState } from '@/hooks/useUrlState'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { folhaService } from '@/modules/admin/rh/folha.service'
import BuscarServidorInput from '@/modules/admin/rh/components/BuscarServidorInput'
import EditarFolhaModal from '@/modules/admin/rh/components/EditarFolhaModal'
import ImportarFolhaTab from '@/modules/admin/rh/components/ImportarFolhaTab'
import HistoricoImportacoesTab from '@/modules/admin/rh/components/HistoricoImportacoesTab'
import { FolhaPagamento, FolhaPagamentoRequest, FolhaPagamentoServidor, Servidor } from '@/modules/admin/rh/types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Edição/exclusão de lançamento — admin-only (podeEditar/podeExcluir('rh') já resolvem
// isso), compartilhado pelas duas abas de listagem (Por servidor / Por mês).
function useEdicaoFolha(aoMudar: () => void) {
  const [editando, setEditando] = useState<{ id: number; mes: number; ano: number; salarioBruto: number; desconto: number } | null>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [erroEdicao, setErroEdicao] = useState<string | null>(null)

  const [excluindoId, setExcluindoId] = useState<number | null>(null)
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<number | null>(null)

  async function salvarEdicao(dados: FolhaPagamentoRequest) {
    if (!editando) return
    setSalvandoEdicao(true)
    setErroEdicao(null)
    try {
      await folhaService.atualizar(editando.id, dados)
      setEditando(null)
      aoMudar()
    } catch (e: unknown) {
      setErroEdicao(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function confirmarExclusao() {
    if (confirmandoExclusaoId == null) return
    setExcluindoId(confirmandoExclusaoId)
    try {
      await folhaService.excluir(confirmandoExclusaoId)
      setConfirmandoExclusaoId(null)
      aoMudar()
    } catch {
      // diálogo permanece aberto pra tentar de novo; sem toast no projeto ainda
    } finally {
      setExcluindoId(null)
    }
  }

  return {
    editando, setEditando, salvandoEdicao, erroEdicao, salvarEdicao,
    confirmandoExclusaoId, setConfirmandoExclusaoId, excluindoId, confirmarExclusao
  }
}

function AbaPorServidor() {
  const { usuario } = useAuth()

  const [servidorSelecionado, setServidorSelecionado] = useState<Servidor | null>(null)
  const servidorId = servidorSelecionado?.id ?? ''
  const [folhas, setFolhas] = useState<FolhaPagamento[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function carregarFolhas(id: number) {
    setLoading(true)
    setErro(null)
    folhaService
      .listarPorServidor(id)
      .then(setFolhas)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (servidorId) carregarFolhas(servidorId)
    else setFolhas([])
  }, [servidorId])

  const hoje = new Date()
  const [novaFolha, setNovaFolha] = useState({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear(), salarioBruto: 0, desconto: 0 })
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!servidorId) return

    setSalvando(true)
    setErroForm(null)

    try {
      await folhaService.criar(servidorId, {
        mes: novaFolha.mes,
        ano: novaFolha.ano,
        salarioBruto: novaFolha.salarioBruto,
        desconto: novaFolha.desconto,
        salarioLiquido: novaFolha.salarioBruto - novaFolha.desconto
      })
      carregarFolhas(servidorId)
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const edicao = useEdicaoFolha(() => servidorId && carregarFolhas(servidorId))
  const podeEditarFolha = podeEditar(usuario, 'rh')
  const podeExcluirFolha = podeExcluir(usuario, 'rh')

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4">
        <label className={classeLabel} htmlFor="servidor">Servidor</label>
        <BuscarServidorInput servidorSelecionado={servidorSelecionado} onSelecionar={setServidorSelecionado} />
      </div>

      {servidorId && podeCriar(usuario, 'rh') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Lançar folha</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={classeLabel} htmlFor="mes">Mês</label>
                <select
                  id="mes"
                  value={novaFolha.mes}
                  onChange={e => setNovaFolha({ ...novaFolha, mes: Number(e.target.value) })}
                  className={classeInput}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  required
                  value={novaFolha.ano}
                  onChange={e => setNovaFolha({ ...novaFolha, ano: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="salarioBruto">Salário bruto</label>
                <input
                  id="salarioBruto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.salarioBruto}
                  onChange={e => setNovaFolha({ ...novaFolha, salarioBruto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="desconto">Desconto</label>
                <input
                  id="desconto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.desconto}
                  onChange={e => setNovaFolha({ ...novaFolha, desconto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <p className="text-sm text-admin-text-muted">
              Salário líquido calculado: <strong className="text-admin-text">{formatarMoeda(novaFolha.salarioBruto - novaFolha.desconto)}</strong>
            </p>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Lançar folha'}
            </button>
          </form>
        </div>
      )}

      {servidorId && (
        <>
          {loading && (
            <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
          )}
          {erro && <AdminErrorState message={erro} />}
          {!loading && !erro && folhas.length === 0 && <AdminEmptyState message="Nenhuma folha lançada para este servidor." />}

          {!loading && !erro && folhas.length > 0 && (
            <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border text-left">
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Mês/Ano</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário bruto</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Desconto</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário líquido</th>
                      {(podeEditarFolha || podeExcluirFolha) && <th className="p-3.5" />}
                    </tr>
                  </thead>
                  <tbody>
                    {folhas.map(f => (
                      <tr key={f.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                        <td className="p-3.5 font-semibold text-admin-text">{MESES[f.mes - 1]}/{f.ano}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioBruto)}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.desconto)}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioLiquido)}</td>
                        {(podeEditarFolha || podeExcluirFolha) && (
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {podeEditarFolha && (
                              <button
                                onClick={() => edicao.setEditando(f)}
                                aria-label="Editar lançamento"
                                className="p-1.5 rounded-lg text-admin-text-faint hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}
                            {podeExcluirFolha && (
                              <button
                                onClick={() => edicao.setConfirmandoExclusaoId(f.id)}
                                aria-label="Excluir lançamento"
                                className="p-1.5 rounded-lg text-admin-text-faint hover:bg-admin-error-light hover:text-admin-error transition-colors"
                              >
                                <MdDelete size={16} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <EditarFolhaModal
        aberto={edicao.editando !== null}
        folha={edicao.editando}
        salvando={edicao.salvandoEdicao}
        erro={edicao.erroEdicao}
        onSalvar={edicao.salvarEdicao}
        onFechar={() => edicao.setEditando(null)}
      />

      <ConfirmDialog
        aberto={edicao.confirmandoExclusaoId !== null}
        titulo="Excluir lançamento de folha?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={edicao.excluindoId !== null}
        onConfirmar={edicao.confirmarExclusao}
        onCancelar={() => edicao.setConfirmandoExclusaoId(null)}
      />
    </div>
  )
}

function AbaPorMes() {
  const { usuario } = useAuth()
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [lista, setLista] = useState<FolhaPagamentoServidor[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [buscou, setBuscou] = useState(false)

  function buscar() {
    setLoading(true)
    setErro(null)
    setBuscou(true)
    folhaService
      .listarPorMes(mes, ano)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  const edicao = useEdicaoFolha(buscar)
  const podeEditarFolha = podeEditar(usuario, 'rh')
  const podeExcluirFolha = podeExcluir(usuario, 'rh')

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className={classeLabel} htmlFor="mes">Mês</label>
          <select
            id="mes"
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className={`${classeInput} w-auto`}
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={classeLabel} htmlFor="ano">Ano</label>
          <input
            id="ano"
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className={`${classeInput} w-auto`}
          />
        </div>
        <button
          onClick={buscar}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          Buscar
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {buscou && !loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhuma folha encontrada nesse mês." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Servidor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CPF</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário bruto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Desconto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário líquido</th>
                  {(podeEditarFolha || podeExcluirFolha) && <th className="p-3.5" />}
                </tr>
              </thead>
              <tbody>
                {lista.map(f => (
                  <tr key={f.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{f.nomeServidor}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{f.cpfServidor}</td>
                    <td className="p-3.5 text-admin-text-muted">{f.cargo ?? '—'}</td>
                    <td className="p-3.5 text-admin-text-muted">{f.unidadeNome ?? '—'}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioBruto)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.descontos)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioLiquido)}</td>
                    {(podeEditarFolha || podeExcluirFolha) && (
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {podeEditarFolha && (
                          <button
                            onClick={() => edicao.setEditando({ id: f.id, mes: f.mes, ano: f.ano, salarioBruto: f.salarioBruto, desconto: f.descontos })}
                            aria-label="Editar lançamento"
                            className="p-1.5 rounded-lg text-admin-text-faint hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluirFolha && (
                          <button
                            onClick={() => edicao.setConfirmandoExclusaoId(f.id)}
                            aria-label="Excluir lançamento"
                            className="p-1.5 rounded-lg text-admin-text-faint hover:bg-admin-error-light hover:text-admin-error transition-colors"
                          >
                            <MdDelete size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditarFolhaModal
        aberto={edicao.editando !== null}
        folha={edicao.editando}
        salvando={edicao.salvandoEdicao}
        erro={edicao.erroEdicao}
        onSalvar={edicao.salvarEdicao}
        onFechar={() => edicao.setEditando(null)}
      />

      <ConfirmDialog
        aberto={edicao.confirmandoExclusaoId !== null}
        titulo="Excluir lançamento de folha?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={edicao.excluindoId !== null}
        onConfirmar={edicao.confirmarExclusao}
        onCancelar={() => edicao.setConfirmandoExclusaoId(null)}
      />
    </div>
  )
}

export default function FolhaPagamentoAdminPage() {
  const [aba, setAba] = useUrlState<'servidor' | 'mes' | 'importar' | 'historico'>('categoria', 'servidor')

  const abas: { valor: 'servidor' | 'mes' | 'importar' | 'historico'; label: string }[] = [
    { valor: 'servidor', label: 'Por servidor' },
    { valor: 'mes', label: 'Por mês' },
    { valor: 'importar', label: 'Importar CSV' },
    { valor: 'historico', label: 'Histórico de importações' }
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Folha de Pagamento</h1>
      <p className="text-sm text-admin-text-faint">
        Cada lançamento é tratado como definitivo por padrão — editar e excluir (individualmente
        ou a última importação inteira) exige confirmação e é restrito ao nível de administrador.
      </p>

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

      {aba === 'servidor' && <AbaPorServidor />}
      {aba === 'mes' && <AbaPorMes />}
      {aba === 'importar' && <ImportarFolhaTab />}
      {aba === 'historico' && <HistoricoImportacoesTab />}
    </div>
  )
}
