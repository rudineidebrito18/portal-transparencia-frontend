import Link from 'next/link';
import React from 'react';

type AccessCardProps = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

export default function AccessCard({ title, icon, href }: AccessCardProps) {
  return (
    <Link
      href={href}
      className="bg-neutral p-6 rounded-lg text-center shadow hover:bg-accent-light transition-all flex flex-col items-center justify-center"
    >
      <div className="text-4xl text-primary mb-2 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-semibold text-text-secondary">
        {title}
      </h3>
    </Link>
  );
}
