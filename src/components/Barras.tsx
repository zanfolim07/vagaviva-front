interface Item {
  rotulo: string
  valor: number
  texto: string
}

export function Barras({ itens, maximo, descricao }: { itens: Item[]; maximo?: number; descricao: string }) {
  const teto = maximo ?? Math.max(...itens.map((i) => i.valor), 1)
  return (
    <ul aria-label={descricao} className="m-0 flex list-none flex-col gap-3.5 p-0">
      {itens.map((item) => (
        <li key={item.rotulo} title={`${item.rotulo}: ${item.texto}`} className="text-left text-[14.5px]">
          <div className="mb-1.5 flex justify-between gap-3">
            <span>{item.rotulo}</span>
            <span className="tabular-nums text-muted">{item.texto}</span>
          </div>
          <div className="h-2 rounded-lg bg-surface">
            <div className="vv-bar h-2 rounded-lg bg-accent" style={{ width: `${Math.min(100, (item.valor / teto) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
