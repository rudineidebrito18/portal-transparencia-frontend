'use client';

import { useState, useRef, useEffect } from 'react';
import { MdExpandMore } from 'react-icons/md';

interface DropdownMenuItemProps {
    label: string;
    children: React.ReactNode;
}

export default function DropdownMenuItem({ label, children }: DropdownMenuItemProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <li
            ref={ref}
            className="relative group h-full"
        >
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-secondary"
                onClick={() => setOpen(prev => !prev)}
            >
                {label} <MdExpandMore />
            </div>
            <ul
                className={`
                    absolute left-0 mt-2 bg-white text-black shadow-lg rounded w-48 z-50
                    hidden group-hover:block
                    md:block md:invisible md:group-hover:visible
                    ${open ? 'block md:visible' : 'hidden md:invisible'}
                `}
            >
                {children}
            </ul>
        </li>
    );
}
