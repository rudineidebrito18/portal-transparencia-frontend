import { MdAttachMoney, MdDescription, MdAssignment, MdPeople } from 'react-icons/md'

const items = [
  { title: 'Despesas', icon: <MdAttachMoney />, href: '#' },
  { title: 'Licitações', icon: <MdDescription />, href: '#' },
  { title: 'Contratos', icon: <MdAssignment />, href: '#' },
  { title: 'Servidores', icon: <MdPeople />, href: '#' },
]

export default function AccessCards() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {items.map(({ title, icon, href }) => (
          <a
            key={title}
            href={href}
            className="bg-blue-50 p-6 rounded-lg text-center shadow hover:bg-blue-100 transition-all flex flex-col items-center justify-center"
          >
            <div className="text-4xl text-blue-700 mb-2 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-base md:text-lg font-semibold text-blue-900">
              {title}
            </h3>
          </a>
        ))}
      </div>
    </section>
  )
}
