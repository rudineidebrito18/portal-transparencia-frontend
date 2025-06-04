import LicitacaoDetalhe from '@/components/licitacao/LicitacaoDetalhe';

export default async function LicitacaoPage({ params }: { params: { id: string } }) {
  
    const licitacoesMock = [
        {
            id: "001",
            numero: '002',
            modalidade: 'CONCORRÊNCIA ELETRÔNICA',
            tipo: 'MENOR PREÇO',

            exercicio: '2025',
            objeto: 'Contratação de empresa para execução de obras de pavimentação asfáltica em diversas ruas do município.',
            dataAbertura: '15/07/2025',
            dataSituacao: '18/07/2025',
            dataPublicacao: '16/07/2025',
            valorEstimado: 500000,
            situacao: 'ABERTA',
            documentos: [
                {
                    descricao: 'Edital',
                    url: '/documentos/edital.pdf',
                    tamanho: '2 MB',
                },
            ],
        }
    ];

    const {id} = await params

    const licitacao = licitacoesMock.find(l => l.id === id);

  if (!licitacao) {
    return <div className="p-4">Licitação não encontrada.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <LicitacaoDetalhe {...licitacao} />
    </div>
  );
}
