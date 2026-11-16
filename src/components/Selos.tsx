import type { ClasseRiscoId, NivelRisco, Risco, StatusConsulta } from '../types'
import { NOME_NIVEL, riscoPercentual } from '../utils/formatos'

export const CORES_NIVEL: Record<NivelRisco, string> = {
  ALTO: 'bg-danger text-[#0b0b0b] border-danger',
  MEDIO: 'bg-transparent text-mid border-mid',
  BAIXO: 'bg-transparent text-accent-text border-accent-deep',
  NAO_CALCULADO: 'bg-transparent text-muted border-line',
}

export function SeloRisco({ risco, comPercentual = true }: { risco: Risco; comPercentual?: boolean }) {
  const pct = riscoPercentual(risco)
  return (
    <span className={`inline-flex h-8 min-w-[104px] items-center justify-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold tracking-[0.05em] ${CORES_NIVEL[risco.nivel]}`}>
      {NOME_NIVEL[risco.nivel]}
      {comPercentual && pct !== null && ` ${pct}%`}
    </span>
  )
}

const STATUS: Record<StatusConsulta, { texto: string; classe: string }> = {
  AGENDADA: { texto: 'AGENDADA', classe: 'border-line text-muted' },
  CONFIRMADA: { texto: 'CONFIRMADA', classe: 'border-accent-deep text-accent-text' },
  LIBERADA: { texto: 'VAGA NA FILA', classe: 'border-mid text-mid' },
  CANCELADA: { texto: 'VAGA NA FILA', classe: 'border-mid text-mid' },
  REALIZADA: { texto: 'COMPARECEU', classe: 'border-accent-deep text-accent-text' },
  FALTA: { texto: 'FALTOU', classe: 'border-danger text-danger-text' },
}

export function SeloStatus({ status }: { status: StatusConsulta }) {
  const s = STATUS[status]
  return <span className={`rounded-md border px-2 py-0.5 text-[11.5px] font-semibold tracking-[0.04em] ${s.classe}`}>{s.texto}</span>
}

const CLASSE: Record<ClasseRiscoId, string> = {
  P1: 'bg-danger text-[#0b0b0b] border-danger',
  P2: 'bg-transparent text-danger-text border-danger',
  P3: 'bg-transparent text-accent-text border-accent-deep',
  P4: 'bg-transparent text-muted border-line',
}

export function SeloClasse({ classe, nome }: { classe: ClasseRiscoId; nome?: string }) {
  return <span className={`justify-self-start whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold tracking-[0.04em] ${CLASSE[classe]}`}>{nome ? `${classe} · ${nome}` : classe}</span>
}

export function Marcador({ children, destaque }: { children: string; destaque?: boolean }) {
  return (
    <span className={`rounded-md px-[7px] py-0.5 text-[10.5px] font-bold tracking-[0.04em] ${destaque ? 'bg-danger text-[#0b0b0b]' : 'bg-surface text-text'}`}>
      {children}
    </span>
  )
}
