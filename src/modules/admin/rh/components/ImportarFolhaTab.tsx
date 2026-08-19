'use client'

import { FormEvent, useRef, useState } from 'react'
import { MdDownload, MdUploadFile } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import { ColunaExportacao } from '@/utils/exportacao'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { folhaService } from '../folha.service'
import { ImportacaoFolhaDetalhe, LinhaIgnorada } from '../types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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

export default function ImportarFolhaTab() {
  const inputServidoresRef = useRef<HTMLInputElement>(null)

  const [importando, setImportando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ImportacaoFolhaDetalhe | null>(null)
  const [exportarAberto, setExportarAberto] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const arquivoServidores = inputServidoresRef.current?.files?.[0]
    if (!arquivoServidores) {
      setErro('Selecione o arquivo Servidores.CSV.')
      return
    }

    setImportando(true)
    setErro(null)
    setResultado(null)

    try {
      const resposta = await folhaService.importar(arquivoServidores)
      setResultado(resposta)
      if (inputServidoresRef.current) inputServidoresRef.current.value = ''
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao importar arquivo.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
        <h2 className="font-semibold text-sm text-admin-text mb-1">Importar folha via CSV</h2>
        <p className="text-xs text-admin-text-faint mb-4">
          Arquivo exportado pelo sistema de RH da prefeitura (Servidores.CSV). Mês e ano são lidos
          do próprio arquivo. Cada linha é 1 cargo/mês — um servidor com mais de um cargo aparece em
          mais de uma linha, casada com o cargo correspondente já cadastrado. Linhas com CPF não
          cadastrado, cargo sem correspondência ou já lançado nesse mês são ignoradas e reportadas
          no resumo abaixo, sem interromper o restante da importação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={classeLabel} htmlFor="importar-servidores">Servidores.CSV</label>
            <input
              id="importar-servidores"
              type="file"
              accept=".csv,text/csv"
              ref={inputServidoresRef}
              className={`${classeInput} md:w-96 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-admin-accent/20 file:text-admin-accent file:text-xs file:font-semibold`}
            />
          </div>

          {erro && <AdminErrorState message={erro} />}

          <button
            type="submit"
            disabled={importando}
            className="flex items-center gap-2 px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
          >
            <MdUploadFile size={18} />
            {importando ? 'Importando...' : 'Importar'}
          </button>
        </form>
      </div>

      {resultado && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-sm text-admin-text">
                {MESES[resultado.mes - 1]}/{resultado.ano} — {resultado.nomeArquivo}
              </h3>
              <p className="text-xs text-admin-text-faint mt-1">
                {resultado.totalLinhas} linha(s) no arquivo · <strong className="text-admin-text">{resultado.totalLancados}</strong> lançada(s) · <strong className="text-admin-error">{resultado.totalIgnorados}</strong> ignorada(s)
              </p>
            </div>

            {resultado.totalIgnorados > 0 && (
              <button
                onClick={() => setExportarAberto(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
              >
                <MdDownload size={16} />
                Exportar linhas ignoradas
              </button>
            )}
          </div>

          {resultado.linhasIgnoradas.length > 0 && (
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
                    {resultado.linhasIgnoradas.map((linha, i) => (
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
        itens={resultado?.linhasIgnoradas ?? []}
        colunas={COLUNAS_EXPORTACAO_IGNORADAS}
        nomeBaseArquivo={`folha-importacao-ignoradas-${resultado?.mes}-${resultado?.ano}`}
      />
    </div>
  )
}
