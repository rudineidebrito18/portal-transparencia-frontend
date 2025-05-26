export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Portal da Transparência</h1>
        <ul className="flex gap-6 text-sm">
          <li><a href="#" className="hover:underline">Início</a></li>
          <li><a href="#" className="hover:underline">Despesas</a></li>
          <li><a href="/licitacoes" className="hover:underline">Licitações</a></li>
          <li><a href="#" className="hover:underline">Contatos</a></li>
        </ul>
      </div>
    </nav>
  )
}
