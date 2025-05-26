const items = [
  { title: 'Despesas', icon: '💸', href: '#' },
  { title: 'Licitações', icon: '📄', href: '#' },
  { title: 'Contratos', icon: '📑', href: '#' },
  { title: 'Servidores', icon: '👥', href: '#' },
]

export default function AccessCards() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        {items.map(({ title, icon, href }) => (
          <a key={title} href={href} className="bg-blue-50 p-6 rounded-xl text-center shadow hover:bg-blue-100 transition">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-blue-900">{title}</h3>
          </a>
        ))}
      </div>
    </section>
  )
}
