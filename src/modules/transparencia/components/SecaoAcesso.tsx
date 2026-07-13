import { SecaoAcesso as SecaoAcessoType } from '../data/secoes'
import ItemAcessoCard from './ItemAcessoCard'

export default function SecaoAcesso({ titulo, icon: Icon, itens }: SecaoAcessoType) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon size={22} />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-primary uppercase">{titulo}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {itens.map((item) => (
          <ItemAcessoCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  )
}
