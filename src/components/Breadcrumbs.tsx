'use client'

import Link from 'next/link'
import { MdChevronRight, MdHome } from 'react-icons/md'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-4 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2 whitespace-nowrap">
        <li className="inline-flex items-center">
          <Link href="/" className="text-text-secondary/60 hover:text-primary transition-colors flex items-center gap-1 text-xs md:text-sm">
            <MdHome size={18} />
            <span className="hidden md:inline">Início</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <MdChevronRight className="text-text-secondary/40" size={20} />
            {item.href ? (
              <Link 
                href={item.href}
                className="ml-1 text-xs md:text-sm font-medium text-text-secondary/60 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-xs md:text-sm font-bold text-primary">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}