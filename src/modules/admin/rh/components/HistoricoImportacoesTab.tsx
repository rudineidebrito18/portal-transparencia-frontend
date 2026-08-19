'use client'

import { useEffect, useState } from 'react'
import { MdDelete, MdDownload, MdVisibility } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import { ColunaExportacao } from '@/utils/exportacao'
import { formatarDataHora } from '@/utils/date'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { folhaService } from '../folha.service'
import { ImportacaoFolhaDetalhe, ImportacaoFolhaResumo, LinhaIgnorada } from '../types'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const MOTIVO_LABEL: Record<LinhaIgnorada['motivo'], string> = {
  SERVIDOR_NAO_CADASTRADO: 'CPF não cadastrado como servidor',
  DUPLICADO_NO_ARQUIVO: 'Mesmo cargo repetido no arquivo',
  JA_LANCADO_NO_MES: 'Já lançado nesse mês para esse cargo',
  CARGO_NAO_ENCONTRADO: 'Cargo do arquivo não bate com nenhum cargo cadastrado do servidor'
}

const COLUNAS_EXPORTACAO_IGNORADAS: ColunaExportacao<LinhaIgnorada>[] = [
  { chave: 'cpfInformado', rotulo: 'CPF' },
  { chave: 'nomeInformado', rotulo: 'Nome' },
  { chave: 'motivo', rotulo: 'Motivo', formatar: item => MOTIVO_LABEL[item.motivo] },
  { chave: 'detalhe', rotulo: 'Cargo no arquivo', formatar: item => item.detalhe ?? '' }
]

export default function HistoricoImportacoesTab() {
  const { usuario } = useAuth()
  const admin = isAdministrador(usuario)

  const [pagina, setPagina] = useState(0)
  const [importacoes, setImportacoes] = useState<ImportacaoFolhaResumo[]>([])
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    folhaService
      .listarImportacoes(pagina)
      .then(p => {
        setImportacoes(p.content)
        setTotalPaginas(p.totalPages)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar histórico'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [pagina])

  const [detalhe, setDetalhe] = useState<ImportacaoFolhaDetalhe | null>(null)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState<number | null>(null)
  const [exportarAberto, setExportarAberto] = useState(false)

  function verDetalhe(id: number) {
    setCarregandoDetalhe(id)
    folhaService
      .buscarImportacao(id)
      .then(setDetalhe)
      .catch(() => {})
      .finally(() => setCarregandoDetalhe(null))
  }

  const [confirmarExclusaoAberto, setConfirmarExclusaoAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExcluirUltima() {
    setExcluindo(true)
    try {
      await folhaService.excluirUltimaImportacao()
      setConfirmarExclusaoAberto(false)
      setDetalhe(null)
      carregar()
    } catch {
      // erro fica implícito pela permanência do diálogo aberto; sem toast no projeto ainda
    } finally {
      setExcluindo(false)
    }
  }

  const ultimaImportacao = pagina === 0 ? importacoes[0] : undefined

  return (
    <div className="space-y-4">
      {admin && ultimaImportacao && (
        <div className="rounded-2xl border border-admin-error/30 bg-admin-error-light p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-admin-text">
              Última importação: {MESES[ultimaImportacao.mes - 1]}/{ultimaImportacao.ano} ({ultimaImportacao.totalLancados} lançamentos)
            </p>
            <p className="text-xs text-admin-text-faint mt-0.5">
              Excluir apaga só os lançamentos dessa importação — não afeta lançamentos manuais nem importações anteriores.
            </p>
          </div>
          <button
            onClick={() => setConfirmarExclusaoAberto(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-admin-error text-white text-xs font-semibold hover:brightness-110 transition-all shrink-0"
          >
            <MdDelete size={16} />
            Excluir última importação
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && importacoes.length === 0 && (
        <AdminEmptyState message="Nenhuma importação de folha realizada ainda." />
      )}

      {!loading && !erro && importacoes.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Mês/Ano</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Usuário</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Lançados</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Ignorados</th>
                  <th className="p-3.5" />
                </tr>
              </thead>
              <tbody>
                {importacoes.map(imp => (
                  <tr key={imp.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{MESES[imp.mes - 1]}/{imp.ano}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarDataHora(imp.dataImportacao)}</td>
                    <td className="p-3.5 text-admin-text-muted">{imp.usuarioEmail}</td>
                    <td className="p-3.5 text-admin-text-muted">{imp.nomeArquivo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{imp.totalLancados}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{imp.totalIgnorados}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => verDetalhe(imp.id)}
                        disabled={carregandoDetalhe === imp.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all disabled:opacity-60"
                      >
                        <MdVisibility size={14} />
                        {carregandoDetalhe === imp.id ? 'Abrindo...' : 'Ver resumo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="p-4" />
        </div>
      )}

      {detalhe && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm text-admin-text">
              Resumo — {MESES[detalhe.mes - 1]}/{detalhe.ano} — {detalhe.nomeArquivo}
            </h3>
            {detalhe.linhasIgnoradas.length > 0 && (
              <button
                onClick={() => setExportarAberto(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
              >
                <MdDownload size={16} />
                Exportar linhas ignoradas
              </button>
            )}
          </div>

          {detalhe.linhasIgnoradas.length === 0 ? (
            <p className="text-sm text-admin-text-muted">Nenhuma linha ignorada nessa importação.</p>
          ) : (
            <div className="rounded-xl border border-admin-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border text-left bg-admin-surface">
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CPF</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Motivo</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo no arquivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalhe.linhasIgnoradas.map((linha, i) => (
                      <tr key={i} className="border-t border-admin-border">
                        <td className="p-3 text-admin-text-muted tabular-nums">{linha.cpfInformado}</td>
                        <td className="p-3 text-admin-text-muted">{linha.nomeInformado}</td>
                        <td className="p-3 text-admin-error">{MOTIVO_LABEL[linha.motivo]}</td>
                        <td className="p-3 text-admin-text-muted">{linha.detalhe ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Linhas ignoradas na importação"
        itens={detalhe?.linhasIgnoradas ?? []}
        colunas={COLUNAS_EXPORTACAO_IGNORADAS}
        nomeBaseArquivo={`folha-importacao-ignoradas-${detalhe?.mes}-${detalhe?.ano}`}
      />

      <ConfirmDialog
        aberto={confirmarExclusaoAberto}
        titulo="Excluir última importação?"
        mensagem={`Isso vai apagar os ${ultimaImportacao?.totalLancados ?? 0} lançamento(s) de folha criados por essa importação. Lançamentos manuais e importações anteriores não são afetados. Essa ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExcluirUltima}
        onCancelar={() => setConfirmarExclusaoAberto(false)}
      />
    </div>
  )
}
