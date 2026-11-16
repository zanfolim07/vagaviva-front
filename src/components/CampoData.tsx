import { useState } from 'react'
import { dataCompleta, hojeIso } from '../utils/formatos'

interface CampoDataProps {
  id: string
  valor: string
  onChange: (iso: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  invalido?: boolean
  compacto?: boolean
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const doisDigitos = (n: number) => String(n).padStart(2, '0')
const paraIso = (a: number, m: number, d: number) => `${a}-${doisDigitos(m + 1)}-${doisDigitos(d)}`

function mascara(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function textoParaIso(texto: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto)
  if (!m) return ''
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])]
  const data = new Date(Date.UTC(ano, mes, dia))
  return data.getUTCMonth() === mes && data.getUTCDate() === dia ? paraIso(ano, mes, dia) : ''
}

export function CampoData({ id, valor, onChange, onBlur, min, max, invalido, compacto = false }: CampoDataProps) {
  const [aberto, setAberto] = useState(false)
  const [digitado, setDigitado] = useState<string | null>(null)
  const [visivel, setVisivel] = useState<{ ano: number; mes: number } | null>(null)

  const hoje = hojeIso()
  const base = valor || hoje
  const ano = visivel?.ano ?? Number(base.slice(0, 4))
  const mes = visivel?.mes ?? Number(base.slice(5, 7)) - 1
  const texto = digitado ?? (valor ? dataCompleta(valor) : '')

  const inicioSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay()
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  const dias = [...Array.from({ length: inicioSemana }, () => null), ...Array.from({ length: totalDias }, (_, i) => i + 1)]

  function mudarMes(passo: number) {
    const data = new Date(Date.UTC(ano, mes + passo, 1))
    setVisivel({ ano: data.getUTCFullYear(), mes: data.getUTCMonth() })
  }

  function digitar(novo: string) {
    const comMascara = mascara(novo)
    setDigitado(comMascara)
    setAberto(true)
    const iso = textoParaIso(comMascara)
    if (iso) {
      onChange(iso)
      setVisivel(null)
    } else if (valor) {
      onChange('')
    }
  }

  function escolher(iso: string) {
    onChange(iso)
    setDigitado(null)
    setVisivel(null)
    setAberto(false)
  }

  const botaoSeta = 'flex h-11 w-11 items-center justify-center rounded-[10px] text-text transition-colors hover:bg-line'
  const seta = (d: string) => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )

  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        aria-invalid={invalido}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        className={`vv-in !pr-11 tabular-nums ${compacto ? 'vv-in-compacto' : ''}`}
        value={texto}
        onChange={(e) => digitar(e.target.value)}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && aberto) {
            e.stopPropagation()
            setAberto(false)
          }
        }}
        onBlur={() => {
          setAberto(false)
          setDigitado(null)
          setVisivel(null)
          onBlur?.()
        }}
      />
      <svg className={`pointer-events-none absolute right-4 text-muted ${compacto ? 'top-[14px]' : 'top-[18px]'}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="3" width="12" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      {aberto && (
        <div role="dialog" aria-label="Calendário" onMouseDown={(e) => e.preventDefault()} className="vv-menu vv-drop absolute left-0 top-full z-30 mt-1.5 w-[336px] max-w-[calc(100vw-48px)] p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="flex">
              <button type="button" tabIndex={-1} aria-label="Ano anterior" className={botaoSeta} onClick={() => mudarMes(-12)}>{seta('M8 3 4 8l4 5M12.5 3l-4 5 4 5')}</button>
              <button type="button" tabIndex={-1} aria-label="Mês anterior" className={botaoSeta} onClick={() => mudarMes(-1)}>{seta('M10 3 5 8l5 5')}</button>
            </span>
            <span className="whitespace-nowrap text-sm font-semibold capitalize">{MESES[mes]} {ano}</span>
            <span className="flex">
              <button type="button" tabIndex={-1} aria-label="Próximo mês" className={botaoSeta} onClick={() => mudarMes(1)}>{seta('m6 3 5 5-5 5')}</button>
              <button type="button" tabIndex={-1} aria-label="Próximo ano" className={botaoSeta} onClick={() => mudarMes(12)}>{seta('M8 3l4 5-4 5M3.5 3l4 5-4 5')}</button>
            </span>
          </div>
          <div className="grid grid-cols-7 text-center text-[11.5px] font-medium text-muted">
            {SEMANA.map((d, i) => <span key={i} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {dias.map((d, i) => {
              if (d === null) return <span key={`v${i}`} />
              const iso = paraIso(ano, mes, d)
              const bloqueado = (!!min && iso < min) || (!!max && iso > max)
              const selecionado = iso === valor
              return (
                <button
                  key={iso}
                  type="button"
                  tabIndex={-1}
                  disabled={bloqueado}
                  aria-label={dataCompleta(iso)}
                  aria-pressed={selecionado}
                  onClick={() => escolher(iso)}
                  className={`h-10 rounded-[10px] text-[13.5px] tabular-nums transition-colors ${selecionado ? 'bg-accent font-semibold text-on-accent' : bloqueado ? 'text-muted opacity-40' : 'text-text hover:bg-line'} ${iso === hoje && !selecionado ? 'ring-1 ring-inset ring-accent-text' : ''}`}
                >
                  {d}
                </button>
              )
            })}
          </div>
          {(!min || hoje >= min) && (!max || hoje <= max) && (
            <button type="button" tabIndex={-1} onClick={() => escolher(hoje)} className="mt-2 flex h-11 w-full items-center justify-center rounded-[10px] text-[13.5px] font-medium text-accent-text transition-colors hover:bg-line">Hoje</button>
          )}
        </div>
      )}
    </div>
  )
}
