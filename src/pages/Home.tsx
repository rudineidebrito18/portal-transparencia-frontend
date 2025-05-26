export default function Home() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold text-blue-800">Bem-vindo ao Portal da Transparência</h2>
      <p className="text-gray-700 max-w-2xl mx-auto">
        Aqui você encontra informações sobre servidores públicos, licitações, contratos,
        relatórios fiscais e muito mais.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white shadow rounded-lg p-6 border">
          <h3 className="text-xl font-semibold text-blue-700">Servidores</h3>
          <p className="text-gray-600">Consulte dados atualizados da folha de pagamento.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border">
          <h3 className="text-xl font-semibold text-blue-700">Licitações</h3>
          <p className="text-gray-600">Acompanhe os processos licitatórios e documentos.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border">
          <h3 className="text-xl font-semibold text-blue-700">Relatórios</h3>
          <p className="text-gray-600">Acesse relatórios de gestão, fiscal e orçamentária.</p>
        </div>
      </div>
    </div>
  );
}
