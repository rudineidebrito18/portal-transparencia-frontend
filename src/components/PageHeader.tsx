import Breadcrumbs from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  breadcrumbItems: { label: string; href?: string }[];
}

export default function PageHeader({ title, breadcrumbItems }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
        {title}
      </h1>
      <div className="h-1 w-20 bg-secondary mt-2 rounded-full" />
    </header>
  );
}