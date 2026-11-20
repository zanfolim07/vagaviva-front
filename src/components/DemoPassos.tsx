import { useState } from 'react'
import { IconeSeta, IconeTelefone } from './Icones'

const PASSOS = [
  { num: '01', titulo: 'Prever', desc: 'A IA calcula o risco de falta de cada consulta e explica o motivo.' },
  { num: '02', titulo: 'Priorizar', desc: 'Risco alto recebe ligação da equipe; o resto, lembrete automático.' },
  { num: '03', titulo: 'Confirmar', desc: 'O paciente confirma ou avisa que não vai, direto pela mensagem.' },
  { num: '04', titulo: 'Realocar', desc: 'A vaga liberada é oferecida na hora ao próximo da lista de espera.' },
]

const LINHA = 'rounded-2xl border bg-surface px-4 py-3.5'
const SELOS = {
  ALTO: 'bg-danger text-on-accent',
  MÉDIO: 'border border-mid text-mid',
  BAIXO: 'border border-accent-deep text-accent-text',
}

function LinhaAgenda({ hora, nome, motivo, nivel }: { hora: string; nome: string; motivo: string; nivel: keyof typeof SELOS }) {
  return (
    <div className={`${LINHA} grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3.5 border-line`}>
      <span className="text-[15px] tabular-nums">{hora}</span>
      <div className="min-w-0 leading-[1.35]">
        <div className="text-[15.5px] font-medium">{nome}</div>
        <div className="text-[13px] text-muted">{motivo}</div>
      </div>
      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.05em] ${SELOS[nivel]}`}>{nivel}</span>
    </div>
  )
}

function Passo0() {
  return (
    <div className="vv-rise flex flex-col gap-3">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xl font-medium">Agenda do dia</span>
        <span className="text-[13.5px] text-muted">Ordenada por risco de falta</span>
      </div>
      <LinhaAgenda hora="08:30" nome="Ana Souza" motivo="Agendada há muito tempo · sem lembrete" nivel="ALTO" />
      <LinhaAgenda hora="09:00" nome="Carlos Mendes" motivo="Já faltou em consultas recentes" nivel="MÉDIO" />
      <LinhaAgenda hora="09:30" nome="Lúcia Ramos" motivo="Agendada há poucos dias" nivel="BAIXO" />
      <LinhaAgenda hora="10:00" nome="Pedro Alves" motivo="Lembrete recebido" nivel="BAIXO" />
      <p className="mb-0 mt-2 text-sm text-muted">O risco é calculado no momento do agendamento e vem sempre com o motivo, em linguagem simples.</p>
    </div>
  )
}

function Passo1() {
  return (
    <div className="vv-rise flex flex-col gap-4">
      <div className="text-xl font-medium">Quem recebe qual contato</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <div className="flex flex-col gap-3 rounded-[18px] border border-danger p-[18px]">
          <div className="flex items-center gap-2 text-sm font-semibold"><IconeTelefone className="text-danger-text" />Contato reforçado</div>
          <div className="text-[13.5px] text-muted">Risco alto: a equipe liga e oferece outro horário se precisar.</div>
          <div className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-3 text-[14.5px]">
            Ana Souza
            <span className="rounded-[10px] bg-accent px-3.5 py-2 text-[13px] font-semibold text-on-accent">Ligar</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-[18px] border border-line p-[18px]">
          <div className="text-sm font-semibold">Lembrete por mensagem</div>
          <div className="text-[13.5px] text-muted">Risco baixo ou médio: confirmação automática.</div>
          {[['Carlos Mendes', 'Enviado'], ['Lúcia Ramos', 'Confirmou'], ['Pedro Alves', 'Confirmou']].map(([n, s]) => (
            <div key={n} className="flex justify-between rounded-xl bg-surface px-3.5 py-2.5 text-[14.5px]">
              <span>{n}</span>
              <span className="text-[12.5px] text-accent-text">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="m-0 text-sm text-muted">O tempo da equipe vai para quem mais precisa, e não para ligar para todo mundo.</p>
    </div>
  )
}

function Passo2() {
  return (
    <div className="vv-rise flex flex-col gap-4">
      <div className="text-xl font-medium">Resposta da paciente</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] items-start gap-[18px]">
        <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-bg p-4">
          <div className="max-w-[90%] self-start rounded-[4px_14px_14px_14px] border border-line bg-surface px-[11px] py-2 text-[13.5px]">Você consegue vir na quinta, às 8h30?</div>
          <div className="max-w-[85%] self-end rounded-[14px_4px_14px_14px] bg-[#1f7a4a] px-[11px] py-2 text-[13.5px] text-[#f5f5f4]">Não vou conseguir</div>
          <div className="max-w-[85%] self-end rounded-[14px_4px_14px_14px] bg-[#1f7a4a] px-[11px] py-2 text-[13.5px] text-[#f5f5f4]">Me chamaram pra trabalhar nesse dia, desculpa</div>
        </div>
        <div className="flex flex-col text-[14.5px]">
          <div className="border-b border-line py-3">Mensagem enviada</div>
          <div className="border-b border-line py-3">Ana respondeu que não vai</div>
          <div className="flex flex-wrap items-center gap-2 py-3">
            Consulta cancelada
            <span className="rounded-full border border-mid px-[9px] py-0.5 text-[11px] font-semibold tracking-[0.05em] text-mid">VAGA LIBERADA</span>
          </div>
        </div>
      </div>
      <p className="m-0 text-sm text-muted">Sem resposta, a recepção liga. Se não conseguir falar com o paciente até 24 horas antes, ela pode liberar a vaga.</p>
    </div>
  )
}

function Passo3() {
  return (
    <div className="vv-rise flex flex-col gap-4">
      <div className="text-xl font-medium">Lista de espera · Clínica geral</div>
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-mid px-4 py-3.5 text-[14.5px]">Vaga liberada: quinta, às 8h30</div>
      <div className={`${LINHA} grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-accent-deep`}>
        <span className="text-sm tabular-nums text-accent-text">1º</span>
        <div className="leading-[1.35]">
          <div className="text-[15.5px] font-medium">João Pereira</div>
          <div className="text-[13px] text-muted">P2 · aceita hoje</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.05em] text-on-accent">
          <span className="vv-pulse h-1.5 w-1.5 rounded-full bg-bg" />VAGA OFERECIDA
        </span>
      </div>
      {[['2º', 'Maria Lopes', 'P2'], ['3º', 'Rita Costa', 'P4']].map(([p, n, c]) => (
        <div key={n} className={`${LINHA} grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-line`}>
          <span className="text-sm tabular-nums text-muted">{p}</span>
          <div className="leading-[1.35]">
            <div className="text-[15.5px] font-medium">{n}</div>
            <div className="text-[13px] text-muted">{c}</div>
          </div>
          <span className="text-[12.5px] text-muted">Aguardando</span>
        </div>
      ))}
      <p className="m-0 text-sm text-muted">A ordem soma a gravidade do caso e o tempo de espera. Para vagas de hoje, entra quem aceita ser chamado em cima da hora.</p>
    </div>
  )
}

const PAINEIS = [Passo0, Passo1, Passo2, Passo3]

export function DemoPassos() {
  const [passo, setPasso] = useState(0)
  const Painel = PAINEIS[passo]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-stretch gap-7">
      <div role="tablist" aria-label="Passos" className="flex flex-col gap-2.5">
        {PASSOS.map((p, i) => {
          const ativo = i === passo
          return (
            <button key={p.num} type="button" role="tab" aria-selected={ativo} onClick={() => setPasso(i)} className={`grid grid-cols-[44px_minmax(0,1fr)] gap-3.5 rounded-[20px] border p-5 text-left text-text transition-colors hover:bg-surface ${ativo ? 'border-accent-deep bg-surface' : 'border-line bg-transparent'}`}>
              <span className={`pt-0.5 text-sm tabular-nums ${ativo ? 'text-accent-text' : 'text-muted'}`}>{p.num}</span>
              <span className="flex flex-col gap-1">
                <span className="text-lg font-medium">{p.titulo}</span>
                <span className="text-[14.5px] leading-[1.45] text-muted">{p.desc}</span>
                <span className="mt-2.5 block h-0.5 rounded-sm bg-line">
                  <span className="block h-0.5 rounded-sm bg-accent transition-[width] duration-500" style={{ width: i <= passo ? '100%' : '0%' }} />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-bg shadow-[0_40px_100px_-50px_rgba(158,247,200,.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-[22px] py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[14.5px] font-bold">Vaga Viva</span>
            <span className="text-[13.5px] text-muted">· Exemplo</span>
          </div>
          <span className="text-[13px] text-muted">Clínica geral</span>
        </div>
        <div className="min-h-[470px] flex-1 p-4 sm:p-[26px]">
          <Painel />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[22px] py-4">
          <span className="text-[12.5px] tabular-nums text-muted">Passo {passo + 1} de 4</span>
          <button type="button" onClick={() => setPasso((passo + 1) % 4)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent-text bg-transparent px-5 text-[14.5px] font-semibold text-accent-text">
            {passo < 3 ? 'Próximo passo' : 'Ver de novo'}
            <IconeSeta tamanho={14} />
          </button>
        </div>
      </div>
    </div>
  )
}