import Header from "@/components/Header";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 mt-8">
        &copy; {new Date().getFullYear()} Prefeitura Municipal. Todos os direitos reservados.
      </footer>
    </div>
  );
}
