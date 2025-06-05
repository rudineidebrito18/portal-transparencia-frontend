import Hero from "@/components/Hero";
import AccessCardSection from "@/components/SectionCardGrid";
import {
  MdAccountCircle,
  MdDescription,
  MdGavel,
  MdHandshake
} from "react-icons/md";

export default function HomePage() {
   return (
    <div className="bg-[--color-neutral] min-h-screen flex flex-col">
      <Hero
        title="Portal da Transparência"
        subtitle="Acompanhe os gastos, receitas e licitações da gestão pública"
        backgroundUrl="/banner-transparencia.jpg"
      />

      <main className="flex-1">
        <AccessCardSection
          title="Licitações e Contratos"
          items={[
            { title: 'Licitações Covid-19', icon: <MdGavel />, href: '#' },
            { title: 'Fiscal De Contratos', icon: <MdAccountCircle />, href: '#' },
            { title: 'Licitações', icon: <MdGavel />, href: '/licitacoes' },
            { title: 'Aditivos De Contratos', icon: <MdHandshake />, href: '#' },
            { title: 'Contratos', icon: <MdDescription />, href: '#' },
          ]}
        />

        {/* Destaques ou bloco informativo */}
        <section className="mt-6 py-12 bg-primary text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Transparência e Cidadania</h2>
            <p className="text-lg leading-relaxed">
              Este portal tem como objetivo garantir o acesso à informação e o controle social
              das contas públicas. Navegue pelos dados de forma clara, simples e segura.
            </p>
          </div>
        </section>
      </main>

    </div>
  );
}
