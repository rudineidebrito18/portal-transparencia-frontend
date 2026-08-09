'use client';

import { useEffect, useRef, useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

interface DropdownMenuItemProps {
  label: string;
  children: React.ReactNode;
}

export default function DropdownMenuItem({ label, children }: DropdownMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <li
      ref={ref}
      className="relative group h-full"
    >
      {/* Botão do menu — no desktop o submenu também abre com :focus-within (não só
          :hover), senão quem navega por teclado cai em links do submenu sem eles
          estarem visíveis na tela. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 cursor-pointer hover:bg-secondary px-2 py-3 lg:py-2"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        {label}
        <MdExpandMore />
      </div>

      {/* Submenu — onClick fecha ao clicar em qualquer item (bubbling do <a>/<Link> filho,
          não precisa que cada chamador feche individualmente). */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions --
          mesmo padrão de delegação: os filhos (<Link>) já são focáveis e ativá-los por
          teclado dispara um `click` nativo que borbulha até aqui, então já funciona sem
          handler próprio no <ul>. */}
      <ul
        onClick={() => setIsOpen(false)}
        className={`
          absolute left-0 top-full w-48 rounded bg-white text-black shadow-md z-50
          max-h-96 overflow-y-auto
          md:invisible md:group-hover:visible md:group-focus-within:visible
          ${isOpen ? 'block md:hidden' : 'hidden md:group-hover:block md:group-focus-within:block'}
        `}
      >
        {children}
      </ul>
    </li>
  );
}
