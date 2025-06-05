import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-primary text-text-primary px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Portal da Transparência</h1>
        <ul className="flex gap-6 text-sm">
          <li><Link href="#" className="hover:underline">Início</Link></li>
          <li><Link href="#" className="hover:underline">Despesas</Link></li>
          <li><Link href="/licitacoes" className="hover:underline">Licitações</Link></li>
          <li><Link href="#" className="hover:underline">Contatos</Link></li>
        </ul>
      </div>
    </nav>
  )
}
