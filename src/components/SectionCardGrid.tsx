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
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            {title}
          </h2>
          <div className="h-1 w-16 bg-secondary mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
