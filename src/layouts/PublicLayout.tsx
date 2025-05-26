import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Portal da Transparência</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Início</Link>
            <Link to="/servidores" className="hover:underline">Servidores</Link>
            <Link to="/licitacoes" className="hover:underline">Licitações</Link>
            <Link to="/relatorios" className="hover:underline">Relatórios</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 mt-8">
        &copy; {new Date().getFullYear()} Prefeitura Municipal. Todos os direitos reservados.
      </footer>
    </div>
  );
}
