import { Suspense } from "react";

import Skeleton from "@/components/ui/Skeleton";
import DiarioOficialDestaque from "@/modules/home/components/DiarioOficialDestaque";
import LicitacoesRecentes from "@/modules/home/components/LicitacoesRecentes";
import NoticiasDestaque from "@/modules/home/components/NoticiasDestaque";

export default function HomePage() {
  return (
    <div className="bg-[--color-neutral] min-h-screen flex flex-col">
      <main className="flex-1">
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
