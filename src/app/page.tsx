import Link from "next/link";
import { Suspense } from "react";

import Skeleton from "@/components/ui/Skeleton";
import DiarioOficialDestaque from "@/modules/home/components/DiarioOficialDestaque";
import Hero from "@/modules/home/components/Hero";
import LicitacoesRecentes from "@/modules/home/components/LicitacoesRecentes";
import NoticiasDestaque from "@/modules/home/components/NoticiasDestaque";

export default function HomePage() {
  return (
    <div className="bg-[--color-neutral] min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />

        <Suspense fallback={<div className="bg-primary/10 py-20"><div className="max-w-4xl mx-auto px-4"><Skeleton className="h-48" /></div></div>}>
          <NoticiasDestaque />
        </Suspense>

        <div className="bg-neutral-light">
          <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10"><Skeleton className="h-64" /></div>}>
            <DiarioOficialDestaque />
          </Suspense>
        </div>

        <div className="bg-white">
          <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10"><Skeleton className="h-64" /></div>}>
            <LicitacoesRecentes />
          </Suspense>
        </div>

        {/* Bloco de fechamento institucional */}
        <section className="py-14 bg-primary-gradient text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Transparência e Cidadania
            </h2>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8">
              Este portal tem como objetivo garantir o acesso à informação e o controle social
              das contas públicas. Navegue pelos dados de forma clara, simples e segura.
            </p>
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-primary font-semibold shadow-sm hover:bg-white/90 hover:shadow-md transition-all"
            >
              Explorar o Portal da Transparência
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
