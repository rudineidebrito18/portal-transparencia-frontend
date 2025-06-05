'use client';

import { MdFileDownload } from 'react-icons/md';

interface Documento {
    descricao: string;
    url: string;
    tamanho: string;
}

interface LicitacaoDetalheProps {
    numero: string;
    modalidade: string;
    tipo: string;
    exercicio: string;
    situacao: string;
    objeto: string;
    dataAbertura: string;
    dataSituacao: string;
    dataPublicacao: string;
    valorEstimado: number;
    documentos: Documento[];
}

export default function LicitacaoDetalhe({
    numero,
    modalidade,
    tipo,
    exercicio,
    situacao,
    objeto,
    dataAbertura,
    dataSituacao,
    dataPublicacao,
    valorEstimado,
    documentos,
}: LicitacaoDetalheProps) {
    return (
        <div className="bg-white shadow rounded p-4 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-primary mb-1">
                        {modalidade} Nº {numero} / {exercicio} - {situacao}
                    </h2>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Tipo:</span> {tipo}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Data de Abertura:</span> {dataAbertura}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Data de Publicação:</span> {dataPublicacao}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Data da Situação:</span> {dataSituacao}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Valor Estimado:</span> R$ {valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex-1 mt-2">
                        <h3 className="text-md font-medium text-gray-800">Objeto</h3>
                        <p className="text-sm text-gray-700 mt-1">{objeto}</p>
                    </div>
                </div>

            </div>

            <div className="mt-6">
                <h3 className="text-md font-medium text-gray-800 mb-2">Documentos</h3>
                <ul className="space-y-2">
                    {documentos.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <span className="text-sm text-gray-700">{doc.descricao}</span>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-primary hover:underline"
                            >
                                <MdFileDownload className="mr-1" />
                                <span className="text-sm">{doc.tamanho}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
