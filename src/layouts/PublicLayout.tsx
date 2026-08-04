import { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import VLibrasReinit from "@/components/VLibrasReinit";
import VLibrasWidget from "@/components/VLibrasWidget";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Saltar para o conteúdo
      </a>

      <Header />

      <main id="conteudo" tabIndex={-1} className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <Footer />

      <VLibrasWidget />
      <VLibrasReinit />
    </div>
  );
}
