import type { ReactNode } from 'react'
import { HttpError, mensagemDeErro } from '../services/http'
import { IconeFechar } from './Icones'

export function Spinner({ escuro = false }: { escuro?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`vv-spin inline-block h-4 w-4 flex-none rounded-full border-2 ${
        escuro ? 'border-[rgba(11,11,11,.3)] border-t-[#0b0b0b]' : 'border-line border-t-accent-text'
      }`}
    />
  )
}

interface CarregandoProps {
  texto: string
  linhas?: number
  altura?: string
}

export function Carregando({ texto, linhas = 4, altura = 'h-[82px]' }: CarregandoProps) {
  return (
    <div aria-live="polite" className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5 py-1 text-sm text-muted">
        <Spinner />
        {texto}
      </div>
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className={`vv-skel rounded-[18px] bg-surface ${altura}`} />
      ))}
    </div>
  )
}

interface ErroTelaProps {
  titulo: string
  erro: unknown
  onTentar: () => void
}

export function ErroTela({ titulo, erro, onTentar }: ErroTelaProps) {
  const semPermissao = erro instanceof HttpError && erro.status === 403
  return (
    <div role="alert" className="flex flex-col items-center gap-2.5 rounded-[20px] border border-danger px-6 py-8 text-center">
      <div className="text-[17px] font-medium">{semPermissao ? 'Você não tem permissão para ver isto.' : titulo}</div>
      <div className="text-sm text-muted">{mensagemDeErro(erro)}</div>
      {!semPermissao && (
        <button type="button" onClick={onTentar} className="vv-ghost">
          Tentar de novo
        </button>
      )}
    </div>
  )
}

interface VazioProps {
  titulo: string
  texto?: string
  children?: ReactNode
  icone?: ReactNode
}

export function Vazio({ titulo, texto, children, icone }: VazioProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[20px] border border-dashed border-line px-6 py-11 text-center">
      {icone && <span className="text-muted">{icone}</span>}
      <div className="text-[17px] font-medium">{titulo}</div>
      {texto && <div className="text-sm text-muted">{texto}</div>}
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

export interface DadosAviso {
  titulo: string
  texto?: string
  tipo?: 'ok' | 'neutro' | 'erro'
}

export function Aviso({ aviso, onFechar }: { aviso: DadosAviso; onFechar: () => void }) {
  const tipo = aviso.tipo ?? 'ok'
  const borda = tipo === 'ok' ? 'border-accent-deep' : tipo === 'erro' ? 'border-danger' : 'border-line'
  const ponto = tipo === 'ok' ? 'bg-accent' : tipo === 'erro' ? 'bg-danger' : 'bg-mid'
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`vv-rise flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${borda}`}>
      <span className={`mt-[7px] h-2.5 w-2.5 flex-none rounded-full ${ponto}`} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold">{aviso.titulo}</div>
        {aviso.texto && <div className="text-[13.5px] text-muted">{aviso.texto}</div>}
      </div>
      <button type="button" onClick={onFechar} aria-label="Fechar aviso" className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-muted">
        <IconeFechar tamanho={16} />
      </button>
    </div>
  )
}
