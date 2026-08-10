import Breadcrumbs from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  breadcrumbItems: { label: string; href?: string }[];
}

// Encapsula o padrão repetido manualmente em ~60 arquivos de página (breadcrumb + h1 +
// barra decorativa). O estilo aqui reflete o que já está em produção em todas essas
// páginas (font-bold, sem escala responsiva) — não o inverso; este componente estava
// sem nenhum consumidor antes e tinha um estilo levemente diferente (font-black,
// tracking-tight, tamanho responsivo) que nunca foi validado visualmente em lugar nenhum.
export default function PageHeader({ title, breadcrumbItems }: PageHeaderProps) {
  return (
    <header>
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide leading-tight mb-3 text-primary uppercase">
        {title}
      </h1>
      <div className="h-1.5 w-14 sm:w-20 rounded-full bg-gradient-to-r from-secondary to-secondary-light mb-6" />
    </header>
  );
}
