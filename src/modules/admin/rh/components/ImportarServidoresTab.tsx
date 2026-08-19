'use client'

import { FormEvent, useRef, useState } from 'react'
import { MdCheckCircle, MdDownload, MdRestartAlt, MdUploadFile } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import { ColunaExportacao } from '@/utils/exportacao'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { servidorService } from '../servidor.service'
import {
  ImportacaoServidorDetalhe,
  ImportacaoServidorPreview,
  LinhaServidorIgnorada,
  UnidadeMatchPreview
} from '../types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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

function BlocoUnidades({ unidades, comMatch }: { unidades: UnidadeMatchPreview[]; comMatch: boolean }) {
  if (unidades.length === 0) return null

  return (
    <div className={`rounded-xl border overflow-hidden ${comMatch ? 'border-admin-success/40' : 'border-admin-error/40'}`}>
      <div className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${comMatch ? 'bg-admin-success-light text-admin-success' : 'bg-admin-error-light text-admin-error'}`}>
        {comMatch ? `Unidades com correspondência (${unidades.length})` : `Unidades SEM correspondência (${unidades.length})`}
      </div>
      <div className="divide-y divide-admin-border">
        {unidades.map(u => (
          <div key={u.nomeInformado} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="text-sm font-medium text-admin-text">{u.nomeInformado}</span>
            {comMatch ? (
              <span className="text-sm text-admin-text-muted flex items-center gap-1.5 sm:ml-auto">
                <MdCheckCircle size={15} className="text-admin-success shrink-0" />
                {u.unidadeNome}
              </span>
            ) : (
              <div className="sm:ml-auto text-right">
                <span className="text-xs text-admin-error font-semibold">
                  {u.motivo === 'UNIDADE_AMBIGUA' ? 'Ambígua' : 'Não encontrada'}
                </span>
                {u.candidatas.length > 0 && (
                  <p className="text-xs text-admin-text-faint mt-1 sm:max-w-lg">
                    <span className="font-semibold">Candidatas:</span> {u.candidatas.join('; ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  onIrParaHistorico: () => void
}

// Fluxo em 2 passos: (a) upload do CSV → prévia (nada é salvo); (b) revisar unidades sem
// match → confirmar importação. O POST /importar usa o MESMO arquivo da prévia.
export default function ImportarServidoresTab({ onIrParaHistorico }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [prevendo, setPrevendo] = useState(false)
  const [preview, setPreview] = useState<ImportacaoServidorPreview | null>(null)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<ImportacaoServidorDetalhe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [exportarAberto, setExportarAberto] = useState(false)

  const temUnidadeSemMatch = (preview?.unidadesSemMatch.length ?? 0) > 0

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
      setErro('Selecione o arquivo CSV exportado pelo sistema de RH.')
      return
    }

    setPrevendo(true)
    setErro(null)
    setPreview(null)
    setResultado(null)

    try {
      setPreview(await servidorService.previewImportacao(arquivoSelecionado))
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
      setResultado(await servidorService.importar(arquivo))
      setPreview(null)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao confirmar a importação.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
        <h2 className="font-semibold text-sm text-admin-text mb-1">Importar servidores via CSV</h2>
        <p className="text-xs text-admin-text-faint mb-4">
          Arquivo exportado pelo sistema de RH da prefeitura (separador &quot;;&quot;, cabeçalho, campos entre
          aspas, encoding Latin-1 — colunas <code className="text-admin-accent">CPF;NOME;NCARGO;NORGAO;HORA_SEM;DAT_ADMISS</code>).
          O upload gera uma <strong className="text-admin-text">prévia sem salvar nada</strong>: você revisa quais
          unidades do arquivo não têm correspondência no portal e só então confirma. Um servidor com várias linhas
          (cargos diferentes no mesmo CPF) vira um cadastro com múltiplos cargos.
        </p>

        {!preview && !resultado && (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className={classeLabel} htmlFor="importar-servidores-arquivo">Arquivo Servidores.CSV</label>
              <input
                id="importar-servidores-arquivo"
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-sm text-admin-text">Prévia da importação — {arquivo?.name}</h3>
                <p className="text-xs text-admin-text-faint mt-1">
                  {preview.totalLinhas} linha(s) no arquivo · <strong className="text-admin-success">{preview.totalServidoresNovos}</strong> servidor(es) novo(s) · <strong className="text-admin-error">{preview.totalLinhasIgnoradas}</strong> linha(s) ignorada(s)
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

            <BlocoUnidades unidades={preview.unidadesSemMatch} comMatch={false} />
            <BlocoUnidades unidades={preview.unidadesComMatch} comMatch />

            {temUnidadeSemMatch && (
              <p className="text-sm text-admin-error bg-admin-error-light border border-admin-error/30 rounded-lg px-4 py-3">
                Existem unidades do arquivo sem correspondência confiável no portal. Resolva os nomes no CSV
                (ou cadastre as unidades) e gere a prévia novamente — as linhas dessas unidades seriam
                <strong> ignoradas</strong> na importação.
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={confirmarImportacao}
                disabled={importando || temUnidadeSemMatch}
                title={temUnidadeSemMatch ? 'Resolva as unidades sem correspondência antes de confirmar' : undefined}
                className="flex items-center gap-2 px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
        </div>
      )}

      {resultado && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-sm text-admin-text">Importação concluída — {resultado.nomeArquivo}</h3>
              <p className="text-xs text-admin-text-faint mt-1">
                {resultado.totalLinhas} linha(s) no arquivo · <strong className="text-admin-success">{resultado.totalCadastrados}</strong> servidor(es) cadastrado(s) · <strong className="text-admin-error">{resultado.totalIgnorados}</strong> linha(s) ignorada(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {resultado.totalIgnorados > 0 && (
                <button
                  onClick={() => setExportarAberto(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
                >
                  <MdDownload size={16} />
                  Exportar linhas ignoradas
                </button>
              )}
              <button
                onClick={onIrParaHistorico}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-3 text-admin-text text-xs font-semibold hover:bg-admin-accent/20 hover:text-admin-accent transition-all"
              >
                Ver histórico de importações
              </button>
            </div>
          </div>

          {resultado.linhasIgnoradas.length === 0 ? (
            <p className="text-sm text-admin-text-muted">Nenhuma linha ignorada — todos os servidores foram cadastrados.</p>
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
                    {resultado.linhasIgnoradas.map((linha, i) => (
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
        titulo="Linhas ignoradas na importação de servidores"
        itens={resultado?.linhasIgnoradas ?? []}
        colunas={COLUNAS_EXPORTACAO_IGNORADAS}
        nomeBaseArquivo={`servidores-importacao-ignoradas-${resultado?.id ?? 'resumo'}`}
      />
    </div>
  )
}
