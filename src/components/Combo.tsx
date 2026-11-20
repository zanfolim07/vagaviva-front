import { useId, useState, type KeyboardEvent } from 'react'
import { normalizar } from '../utils/formatos'
import { IconeCheck } from './Icones'

export interface OpcaoCombo {
  valor: string
  rotulo: string
  detalhe?: string
}

interface ComboProps {
  id: string
  opcoes: OpcaoCombo[]
  valor: string
  onChange: (valor: string) => void
  onBlur?: () => void
  livre?: boolean
  placeholder?: string
  invalido?: boolean
  compacto?: boolean
}

const LIMITE = 60

export function Combo({ id, opcoes, valor, onChange, onBlur, livre = false, placeholder, invalido, compacto = false }: ComboProps) {
  const listaId = useId()
  const [aberto, setAberto] = useState(false)
  const [digitado, setDigitado] = useState<string | null>(null)
  const [ativo, setAtivo] = useState(0)

  const selecionada = opcoes.find((o) => o.valor === valor)
  const texto = livre ? valor : (digitado ?? selecionada?.rotulo ?? '')
  const termo = normalizar(livre ? valor : (digitado ?? ''))
  const filtradas = opcoes
    .filter((o) => !termo || normalizar(`${o.rotulo} ${o.detalhe ?? ''}`).includes(termo) || (o.detalhe ?? '').replace(/\s/g, '').includes(termo))
    .slice(0, LIMITE)
  const indiceAtivo = Math.min(ativo, Math.max(filtradas.length - 1, 0))
  const mostrar = aberto && (filtradas.length > 0 || !livre)

  function escolher(o: OpcaoCombo) {
    onChange(o.valor)
    setDigitado(null)
    setAberto(false)
  }

  function digitar(novo: string) {
    setAberto(true)
    setAtivo(0)
    if (livre) {
      onChange(novo)
      return
    }
    setDigitado(novo)
    if (valor) onChange('')
  }

  function tecla(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setAberto(true)
      const passo = e.key === 'ArrowDown' ? 1 : -1
      setAtivo((indiceAtivo + passo + filtradas.length) % Math.max(filtradas.length, 1))
    } else if (e.key === 'Enter' && mostrar && filtradas[indiceAtivo]) {
      e.preventDefault()
      escolher(filtradas[indiceAtivo])
    } else if (e.key === 'Escape' && aberto) {
      e.stopPropagation()
      setAberto(false)
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={mostrar && filtradas[indiceAtivo] ? `${listaId}-${indiceAtivo}` : undefined}
        aria-invalid={invalido}
        autoComplete="off"
        className={`vv-in !pr-11 ${compacto ? 'vv-in-compacto' : ''}`}
        placeholder={placeholder}
        value={texto}
        onChange={(e) => digitar(e.target.value)}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onKeyDown={tecla}
        onBlur={() => {
          setAberto(false)
          setDigitado(null)
          onBlur?.()
        }}
      />
      <svg className={`pointer-events-none absolute right-4 text-muted transition-transform ${compacto ? 'top-[18px]' : 'top-[22px]'} ${mostrar ? 'rotate-180' : ''}`} width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
        <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {mostrar && (
        <ul id={listaId} role="listbox" className="vv-menu vv-drop absolute left-0 right-0 top-full z-30 m-0 mt-1.5 max-h-64 list-none overflow-y-auto p-1.5">
          {filtradas.map((o, i) => (
            <li
              key={o.valor}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={o.valor === valor}
              onMouseEnter={() => setAtivo(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                escolher(o)
              }}
              data-ativo={i === indiceAtivo}
              data-selecionado={o.valor === valor}
              className="vv-menu-item flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-1.5 text-left text-[14.5px]"
            >
              <span className="flex min-w-0 flex-col">
                <span>{o.rotulo}</span>
                {o.detalhe && <span className="text-[12.5px] font-normal opacity-70">{o.detalhe}</span>}
              </span>
              {o.valor === valor && <IconeCheck tamanho={14} className="flex-none" />}
            </li>
          ))}
          {filtradas.length === 0 && <li className="px-3 py-2.5 text-left text-sm text-muted">Nada encontrado.</li>}
        </ul>
      )}
    </div>
  )
}
