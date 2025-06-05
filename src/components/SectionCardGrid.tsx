import { ReactNode } from 'react';
import AccessCard from './AccessCard';

type AccessCardSectionProps = {
  title: string;
  items: {
    title: string;
    icon: ReactNode;
    href: string;
  }[];
};

export default function AccessCardSection({ title, items }: AccessCardSectionProps) {
  return (
    <section className="bg-neutral-dark py-10 rounded-lg shadow-sm px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-text-secondary">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <AccessCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
