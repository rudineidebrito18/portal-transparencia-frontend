'use client'

import { useEffect, useState } from 'react'
import { MdDownload, MdVisibility } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import { ColunaExportacao } from '@/utils/exportacao'
import { formatarDataHora } from '@/utils/date'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { servidorService } from '../servidor.service'
import {
  ImportacaoServidorDetalhe,
  ImportacaoServidorResumo,
  LinhaServidorIgnorada
} from '../types'

const MOTIVO_LABEL: Record<LinhaServidorIgnorada['motivo'], string> = {
  CPF_INVALIDO: 'CPF inválido',
  DADOS_INCOMPLETOS: 'Dados incompletos (nome em branco)',
  DUPLICADO_NO_ARQUIVO: 'Cargo repetido no arquivo (duplicado)',
  JA_CADASTRADO: 'CPF já cadastrado',
  UNIDADE_NAO_ENCONTRADA: 'Unidade não encontrada no portal',
  UNIDADE_AMBIGUA: 'Unidade ambígua (mais de uma correspondência)'
}

const COLUNAS_EXPORTACAO_IGNORADAS: ColunaExportacao<LinhaServidorIgnorada>[] = [
  { chave: 'cpfInformado', rotulo: 'CPF' },
  { chave: 'nomeInformado', rotulo: 'Nome' },
  { chave: 'unidadeInformada', rotulo: 'Unidade informada' },
  { chave: 'motivo', rotulo: 'Motivo', formatar: item => MOTIVO_LABEL[item.motivo] },
  { chave: 'detalhe', rotulo: 'Detalhe' }
]

export default function HistoricoImportacoesServidorTab() {
  const [pagina, setPagina] = useState(0)
  const [importacoes, setImportacoes] = useState<ImportacaoServidorResumo[]>([])
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    servidorService
      .listarImportacoes(pagina)
      .then(p => {
        setImportacoes(p.content)
        setTotalPaginas(p.totalPages)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar histórico'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [pagina])

  const [detalhe, setDetalhe] = useState<ImportacaoServidorDetalhe | null>(null)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState<number | null>(null)
  const [exportarAberto, setExportarAberto] = useState(false)

  function verDetalhe(id: number) {
    setCarregandoDetalhe(id)
    servidorService
      .buscarImportacao(id)
      .then(setDetalhe)
      .catch(() => {})
      .finally(() => setCarregandoDetalhe(null))
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && importacoes.length === 0 && (
        <AdminEmptyState message="Nenhuma importação de servidores realizada ainda." />
      )}

      {!loading && !erro && importacoes.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Usuário</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Linhas</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cadastrados</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Ignorados</th>
                  <th className="p-3.5" />
                </tr>
              </thead>
              <tbody>
                {importacoes.map(imp => (
                  <tr key={imp.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarDataHora(imp.dataImportacao)}</td>
                    <td className="p-3.5 text-admin-text-muted">{imp.usuarioEmail}</td>
                    <td className="p-3.5 text-admin-text-muted">{imp.nomeArquivo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{imp.totalLinhas}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{imp.totalCadastrados}</td>
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
            <div>
              <h3 className="font-semibold text-sm text-admin-text">
                Resumo — {detalhe.nomeArquivo}
              </h3>
              <p className="text-xs text-admin-text-faint mt-1">
                {detalhe.totalLinhas} linha(s) · <strong className="text-admin-success">{detalhe.totalCadastrados}</strong> cadastrado(s) · <strong className="text-admin-error">{detalhe.totalIgnorados}</strong> ignorada(s) — por {detalhe.usuarioEmail} em {formatarDataHora(detalhe.dataImportacao)}
              </p>
            </div>
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
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade informada</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalhe.linhasIgnoradas.map((linha, i) => (
                      <tr key={i} className="border-t border-admin-border">
                        <td className="p-3 text-admin-text-muted tabular-nums">{linha.cpfInformado}</td>
                        <td className="p-3 text-admin-text-muted">{linha.nomeInformado}</td>
                        <td className="p-3 text-admin-text-muted">{linha.unidadeInformada}</td>
                        <td className="p-3">
                          <span className="text-admin-error">{MOTIVO_LABEL[linha.motivo]}</span>
                          {linha.detalhe && <span className="block text-xs text-admin-text-faint mt-0.5">{linha.detalhe}</span>}
                        </td>
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
        titulo="Linhas ignoradas na importação de servidores"
        itens={detalhe?.linhasIgnoradas ?? []}
        colunas={COLUNAS_EXPORTACAO_IGNORADAS}
        nomeBaseArquivo={`servidores-importacao-ignoradas-${detalhe?.id ?? 'resumo'}`}
      />
    </div>
  )
}
