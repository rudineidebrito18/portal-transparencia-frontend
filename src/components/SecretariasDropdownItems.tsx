'use client';

import Link from 'next/link';

import { useAsyncData } from '@/hooks/useAsyncData';
import { secretariasService } from '@/modules/secretarias/secretarias.service';

interface Props {
  onNavigate: () => void;
}

export default function SecretariasDropdownItems({ onNavigate }: Props) {
  const { data, loading, erro } = useAsyncData(
    () => secretariasService.listar({ sort: 'nome,asc' }),
    [],
    []
  );

  return (
    <>
      {loading && <p className="px-4 py-2 text-text-secondary/50">Carregando...</p>}
      {erro && <p className="px-4 py-2 text-error">Erro ao carregar secretarias.</p>}

      {!loading && !erro && data.map(unidade => (
        <Link
          key={unidade.id}
          href={`/secretarias/${unidade.id}`}
          className="px-4 py-2 hover:bg-neutral-dark block"
          onClick={onNavigate}
        >
          {unidade.nome}
        </Link>
      ))}

      <Link
        href="/secretarias"
        className="px-4 py-2 hover:bg-neutral-dark block font-semibold border-t border-border/20"
        onClick={onNavigate}
      >
        Todas as Secretarias
      </Link>
    </>
  );
}
