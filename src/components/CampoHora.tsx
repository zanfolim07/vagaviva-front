interface CampoHoraProps {
  id: string
  valor: string
  onChange: (valor: string) => void
  onBlur?: () => void
  invalido?: boolean
}

function mascara(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`
}

export function CampoHora({ id, valor, onChange, onBlur, invalido }: CampoHoraProps) {
  return <input id={id} inputMode="numeric" autoComplete="off" placeholder="00:00" aria-invalid={invalido} className="vv-in tabular-nums" value={valor} onChange={(e) => onChange(mascara(e.target.value))} onBlur={onBlur} />
}
