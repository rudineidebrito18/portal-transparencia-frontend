'use client'

import { FormEvent, useRef, useState } from 'react'
import { MdDownload, MdRestartAlt, MdUploadFile } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import { ColunaExportacao } from '@/utils/exportacao'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { folhaService } from '../folha.service'
import {
  FolhaLinhaPreview,
  ImportacaoFolhaDetalhe,
  ImportacaoFolhaPreview,
  LinhaIgnorada
} from '../types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const MOTIVO_LABEL: Record<LinhaIgnorada['motivo'], string> = {
  SERVIDOR_NAO_CADASTRADO: 'CPF não cadastrado como servidor',
  DUPLICADO: 'Já lançado nesse mês (duplicado)'
}

const COLUNAS_EXPORTACAO_IGNORADAS: ColunaExportacao<LinhaIgnorada>[] = [
  { chave: 'cpfInformado', rotulo: 'CPF' },
  { chave: 'nomeInformado', rotulo: 'Nome' },
  { chave: 'motivo', rotulo: 'Motivo', formatar: item => MOTIVO_LABEL[item.motivo] }
]

function BlocoLinhas({
  titulo,
  linhas,
  destaque = false,
  descricao
}: {
  titulo: string
  linhas: FolhaLinhaPreview[]
  destaque?: boolean
  descricao?: string
}) {
  if (linhas.length === 0) return null

  return (
    <div className={`rounded-xl border overflow-hidden ${destaque ? 'border-admin-error/40' : 'border-admin-border'}`}>
      <div className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${destaque ? 'bg-admin-error-light text-admin-error' : 'bg-admin-surface text-admin-text-faint'}`}>
        {titulo} ({linhas.length})
      </div>
      {descricao && (
        <p className="px-4 py-2 text-xs text-admin-text-faint border-b border-admin-border/60">
          {descricao}
        </p>
      )}
      <div className="divide-y divide-admin-border bg-admin-surface-2">
        {linhas.map(linha => (
          <div key={linha.cpf} className="px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-0.5">
            <span className="text-sm text-admin-text-muted tabular-nums">{linha.cpf}</span>
            <span className="text-sm text-admin-text-muted">{linha.nome}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fluxo em 2 passos (mesmo modelo da importação de servidores): upload do Servidores.CSV →
// prévia (nada é salvo) → confirmar. Rubricas.CSV foi descontinuado pelo backend.
export default function ImportarFolhaTab() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [prevendo, setPrevendo] = useState(false)
  const [preview, setPreview] = useState<ImportacaoFolhaPreview | null>(null)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<ImportacaoFolhaDetalhe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [exportarAberto, setExportarAberto] = useState(false)

  function limparTudo() {
    setPreview(null)
    setResultado(null)
    setErro(null)
    setArquivo(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handlePreview(e: FormEvent) {
    e.preventDefault()
    const arquivoSelecionado = inputRef.current?.files?.[0]
    if (!arquivoSelecionado) {
      setErro('Selecione o arquivo Servidores.CSV exportado pelo sistema de RH.')
      return
    }

    setPrevendo(true)
    setErro(null)
    setPreview(null)
    setResultado(null)

    try {
      setPreview(await folhaService.previewImportacao(arquivoSelecionado))
      setArquivo(arquivoSelecionado)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar a prévia.')
    } finally {
      setPrevendo(false)
    }
  }

  async function confirmarImportacao() {
    if (!arquivo) return

    setImportando(true)
    setErro(null)

    try {
      setResultado(await folhaService.importar(arquivo))
      setPreview(null)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao confirmar a importação.')
    } finally {
      setImportando(false)
    }
  }

  const servidoresNaoCadastrados = preview?.servidoresNaoCadastrados ?? []
  const temServidorNaoCadastrado = servidoresNaoCadastrados.length > 0

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
        <h2 className="font-semibold text-sm text-admin-text mb-1">Importar folha via CSV</h2>
        <p className="text-xs text-admin-text-faint mb-4">
          Arquivo <strong className="text-admin-text">Servidores.CSV</strong> (resumo por servidor, pipe-delimited,
          sem cabeçalho) exportado pelo sistema de RH da prefeitura. Mês e ano são lidos do próprio arquivo. O upload
          gera uma <strong className="text-admin-text">prévia sem salvar nada</strong>: você confere os CPFs que ainda
          não têm servidor cadastrado (e os que já têm folha no mês) e só então confirma.
        </p>

        {!preview && !resultado && (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className={classeLabel} htmlFor="importar-folha-arquivo">Arquivo Servidores.CSV</label>
              <input
                id="importar-folha-arquivo"
                type="file"
                accept=".csv,text/csv"
                ref={inputRef}
                className={`${classeInput} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-admin-accent/20 file:text-admin-accent file:text-xs file:font-semibold`}
              />
            </div>

            {erro && <AdminErrorState message={erro} />}

            <button
              type="submit"
              disabled={prevendo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              <MdUploadFile size={18} />
              {prevendo ? 'Gerando prévia...' : 'Gerar prévia'}
            </button>
          </form>
        )}
      </div>

      {prevendo && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}

      {preview && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-sm text-admin-text">
                Prévia — {MESES[preview.mes - 1]}/{preview.ano} — {arquivo?.name}
              </h3>
              <p className="text-xs text-admin-text-faint mt-1">
                {preview.totalLinhas} linha(s) no arquivo · <strong className="text-admin-success">{preview.totalLancamentos}</strong> lançamento(s) · <strong className="text-admin-error">{preview.totalIgnorados}</strong> ignorado(s)
              </p>
            </div>
            <button
              onClick={limparTudo}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
            >
              <MdRestartAlt size={16} />
              Começar de novo
            </button>
          </div>

          {erro && <AdminErrorState message={erro} />}

          <BlocoLinhas
            titulo="Servidores não cadastrados"
            linhas={servidoresNaoCadastrados}
            destaque
            descricao="O funcionário ainda não existe no portal — importe os servidores (tela Servidores) e gere a prévia de novo para que entre na folha."
          />

          <BlocoLinhas
            titulo="Linhas duplicadas no arquivo"
            linhas={preview.linhasDuplicadasNoArquivo}
            descricao="Mesmo CPF repetido dentro do arquivo — provável erro de exportação ou funcionário com 2 cargos (a confirmar com o RH); a segunda linha é ignorada."
          />

          <BlocoLinhas
            titulo="Já lançados no mês"
            linhas={preview.jaLancadosNoMes}
            descricao="Folha daquele CPF/mês já existe — não será duplicada."
          />

          {temServidorNaoCadastrado && (
            <p className="text-sm text-admin-error bg-admin-error-light border border-admin-error/30 rounded-lg px-4 py-3">
              {servidoresNaoCadastrados.length} servidor(es) não cadastrado(s) seriam <strong>ignorados</strong> —
              importe os servidores primeiro se quiser que entrem na folha.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={confirmarImportacao}
              disabled={importando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              <MdUploadFile size={18} />
              {importando ? 'Importando...' : 'Confirmar importação'}
            </button>
            <button
              onClick={limparTudo}
              disabled={importando}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.linhasIgnoradas.map((linha, i) => (
                      <tr key={i} className="border-t border-admin-border">
                        <td className="p-3 text-admin-text-muted tabular-nums">{linha.cpfInformado}</td>
                        <td className="p-3 text-admin-text-muted">{linha.nomeInformado}</td>
                        <td className="p-3 text-admin-error">{MOTIVO_LABEL[linha.motivo]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={limparTudo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
            >
              <MdRestartAlt size={16} />
              Nova importação
            </button>
          </div>
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
