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
      {/* Botão do menu */}
      <div
        className="flex items-center gap-1 cursor-pointer hover:bg-secondary px-2 py-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <MdExpandMore />
      </div>

      {/* Submenu */}
      <ul
        className={`
          absolute left-0 top-full w-48 rounded bg-white text-black shadow-md z-50
          md:invisible md:group-hover:visible
          ${isOpen ? 'block md:hidden' : 'hidden md:group-hover:block'}
        `}
      >
        {children}
      </ul>
    </li>
  );
}
