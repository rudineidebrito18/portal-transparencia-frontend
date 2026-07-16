'use client'

import { useEffect, useState } from 'react'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { esicFormularioService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { LABELS_TIPO_SOLICITACAO_ESIC, FormularioEsic, TipoSolicitacaoEsic } from '@/modules/admin/esic-ouvidoria/types'

export default function EsicFormulariosAdminPage() {
  const [tipo, setTipo] = useState<TipoSolicitacaoEsic | ''>('')
  const [lista, setLista] = useState<FormularioEsic[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)

    esicFormularioService
      .listar(tipo || undefined)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [tipo])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">E-SIC — Formulários Recebidos</h1>
      <p className="text-sm text-text-secondary/70">
        Somente leitura — o backend ainda não expõe edição/exclusão de solicitações do E-SIC.
      </p>

      <Card className="p-4" hoverable={false}>
        <label className="block text-sm font-medium mb-1">Filtrar por tipo</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as TipoSolicitacaoEsic | '')}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(LABELS_TIPO_SOLICITACAO_ESIC) as TipoSolicitacaoEsic[]).map(t => (
            <option key={t} value={t}>{LABELS_TIPO_SOLICITACAO_ESIC[t]}</option>
          ))}
        </select>
      </Card>

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum formulário encontrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3">Solicitante</th>
                <th className="p-3">Solicitação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(item => (
                <tr key={item.id} className="border-t border-border/20 align-top">
                  <td className="p-3 whitespace-nowrap">
                    <Badge className="bg-primary/10 text-primary">{LABELS_TIPO_SOLICITACAO_ESIC[item.tipoSolicitacao]}</Badge>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {item.anonima ? (
                      <span className="text-text-secondary/60 italic">Anônimo</span>
                    ) : (
                      <>
                        <p className="font-semibold">{item.nome}</p>
                        <p className="text-xs text-text-secondary/60">{item.email}</p>
                      </>
                    )}
                  </td>
                  <td className="p-3 max-w-lg">{item.solicitacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
