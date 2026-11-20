import type { ReactNode } from 'react'
import type { FieldErrors, FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { HttpError } from '../services/http'
import { Spinner } from './Estados'

interface CampoProps {
  id: string
  rotulo: ReactNode
  erro?: string
  obrigatorio?: boolean
  ajuda?: string
  children: ReactNode
}

export function Campo({ id, rotulo, erro, obrigatorio, ajuda, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="vv-lbl">
        {rotulo}
        {obrigatorio && (
          <span className="text-danger-text" title="Obrigatório">
            {' *'}
          </span>
        )}
      </label>
      {children}
      {ajuda && <p className="vv-help">{ajuda}</p>}
      {erro && (
        <p id={`${id}-erro`} className="vv-err">
          {erro}
        </p>
      )}
    </div>
  )
}

interface BotaoEnvioProps {
  enviando: boolean
  texto: string
  textoEnviando: string
  className?: string
}

export function BotaoEnvio({ enviando, texto, textoEnviando, className = '' }: BotaoEnvioProps) {
  return (
    <button type="submit" disabled={enviando} className={`vv-primary ${className}`}>
      {enviando && <Spinner escuro />}
      {enviando ? textoEnviando : texto}
    </button>
  )
}

interface OpcoesProps<T extends string> {
  rotulo: string
  opcoes: { id: T; label: ReactNode }[]
  valor: T | null
  onEscolher: (valor: T) => void
  className?: string
  botaoClassName?: string
}

export function Opcoes<T extends string>({ rotulo, opcoes, valor, onEscolher, className = 'flex flex-wrap gap-1.5', botaoClassName = 'min-h-11 rounded-full px-4 text-[13.5px]' }: OpcoesProps<T>) {
  return (
    <div role="group" aria-label={rotulo} className={className}>
      {opcoes.map((o) => {
        const ativo = o.id === valor
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onEscolher(o.id)}
            className={`border transition-colors ${botaoClassName} ${ativo ? 'border-inv-bg bg-inv-bg text-inv-fg' : 'border-line bg-transparent text-text'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function aplicarErrosDeCampo<T extends FieldValues>(erro: unknown, setError: UseFormSetError<T>, mapa: Record<string, Path<T>> = {}): boolean {
  if (!(erro instanceof HttpError) || erro.status !== 400 || !erro.corpo?.campos.length) {
    return false
  }
  erro.corpo.campos.forEach(({ campo, mensagem }) => {
    setError((mapa[campo] ?? campo) as Path<T>, { type: 'api', message: mensagem })
  })
  return true
}

export const erroDe = <T extends FieldValues>(errors: FieldErrors<T>, nome: keyof T) => errors[nome]?.message as string | undefined
