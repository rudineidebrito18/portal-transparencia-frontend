import Link from 'next/link';
import React from 'react';

import Card from '@/components/ui/Card';

type AccessCardProps = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

export default function AccessCard({ title, icon, href }: AccessCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl transition-colors group-hover:bg-primary group-hover:text-white">
          {icon}
        </div>
        <h3 className="text-sm md:text-base font-semibold text-text-secondary transition-colors group-hover:text-primary">
          {title}
        </h3>
      </Card>
    </Link>
  );
}
