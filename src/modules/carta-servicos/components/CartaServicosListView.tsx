'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import PdfViewer from '@/components/ui/PdfViewer'
import Skeleton from '@/components/ui/Skeleton'
import { formatarData } from '@/utils/date'
import { useCartaServicos } from '../hooks/useCartaServicos'

// Diferente dos outros módulos "documento genérico" (Legislação, Competências etc.), que
// usam DocumentoGenericoListPanel com um link "Ver documento" pra /documento — pedido
// explícito do usuário foi manter isso numa página só, com o texto explicativo acima do
// PDF já embutido ali, em vez de navegar pra uma segunda página só pra ver o arquivo. Sem
// FiltroCard/busca de propósito: esse documento normalmente tem 1, no máximo 2-3 versões
// (atualiza raramente, diferente de relatório mensal/anual recorrente), filtro por título
// seria ruído.
export default function CartaServicosListView() {
  const { data: documentos, loading, erro, pagina, totalPaginas, setPagina } = useCartaServicos()

  return (
    <div className="space-y-8">

      <p className="text-sm text-text-secondary/70 max-w-3xl">
        A Carta de Serviços ao Usuário, prevista na Lei nº 13.460/2017, reúne os
        principais serviços oferecidos pela Prefeitura, as formas de acesso e os padrões
        de qualidade no atendimento — é um instrumento de transparência que ajuda o
        cidadão a acompanhar e cobrar a prestação de serviços públicos.
      </p>

      {erro && <ErrorState message={erro} />}

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-24" />
        </div>
      )}

      {!loading && !erro && (
        <>
          {documentos.length === 0 ? (
            <EmptyState message="Nenhuma Carta de Serviços publicada no momento." />
          ) : (
            <div className="space-y-8">
              {documentos.map(documento => (
                <div key={documento.id}>
                  <p className="text-xs text-text-secondary/50 mb-2">
                    Referência de {formatarData(documento.data)}
                  </p>
                  <PdfViewer src={documento.caminhoArquivo} titulo={documento.descricao} />
                </div>
              ))}
            </div>
          )}

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-2" />
        </>
      )}
    </div>
  )
}
