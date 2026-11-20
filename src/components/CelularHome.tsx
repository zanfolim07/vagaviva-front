const VERDE = '#2BD47D'

function Lidas() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
      <path d="M1 5.5l2.8 2.8L9.5 2.5M6.5 8.3l5.8-5.8" fill="none" stroke="#7fe3b0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Recebida({ atraso, horario, cauda, children }: { atraso: string; horario: string; cauda?: boolean; children: string }) {
  return (
    <div className={`vv-msg ${atraso} ${cauda ? 'vv-tin rounded-[0_14px_14px_14px]' : 'rounded-[14px]'} max-w-[84%] self-start bg-[#1e2321] px-[11px] pb-[5px] pt-2 text-[13.5px] leading-[1.42] shadow-[0_1px_0_rgba(0,0,0,.4)]`}>
      {children}
      <span className="mt-px block text-right text-[10.5px] text-[#9a9a99]">{horario}</span>
    </div>
  )
}

function Enviada({ atraso, horario, cauda, children }: { atraso: string; horario: string; cauda?: boolean; children: string }) {
  return (
    <div className={`vv-msg ${atraso} ${cauda ? 'vv-tout rounded-[14px_0_14px_14px]' : 'rounded-[14px]'} max-w-[78%] self-end bg-[#1b6b43] px-[11px] pb-[5px] pt-2 text-[13.5px] leading-[1.42] shadow-[0_1px_0_rgba(0,0,0,.4)]`}>
      {children}
      <span className="mt-px flex items-center justify-end gap-[3px] text-[10.5px] text-[#cfe9da]">{horario}<Lidas /></span>
    </div>
  )
}

function BotaoResposta({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 border-t border-[#2a2a2a] p-2 text-[13.5px] font-medium text-[#2bd47d]">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3 2 7l4 4M2 7h8a4 4 0 0 1 4 4v2" fill="none" stroke={VERDE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {children}
    </div>
  )
}

export function CelularHome() {
  return (
    <div className="vv-phone-scale">
      <div
        role="img"
        aria-label="Celular mostrando a conversa: a UBS Centro confirma a consulta de Ana, ela avisa que não vai conseguir ir e a UBS informa que a vaga vai para outro paciente."
        className="vv-phone vv-force-dark relative h-[764px] w-[344px] rounded-[60px] bg-[linear-gradient(160deg,#6b6b6b_0%,#2a2a2a_12%,#3a3a3a_30%,#1a1a1a_55%,#4a4a4a_78%,#222_100%)] p-[3px] shadow-[0_34px_80px_-30px_rgba(0,0,0,.9),0_30px_110px_-50px_rgba(158,247,200,.3)]"
      >
        <span aria-hidden="true" className="absolute -left-1 top-[128px] h-[30px] w-[5px] rounded-l-[3px] bg-[linear-gradient(90deg,#1a1a1a,#5a5a5a_60%,#2a2a2a)]" />
        <span aria-hidden="true" className="absolute -left-1 top-[184px] h-[60px] w-[5px] rounded-l-[3px] bg-[linear-gradient(90deg,#1a1a1a,#5a5a5a_60%,#2a2a2a)]" />
        <span aria-hidden="true" className="absolute -left-1 top-[256px] h-[60px] w-[5px] rounded-l-[3px] bg-[linear-gradient(90deg,#1a1a1a,#5a5a5a_60%,#2a2a2a)]" />
        <span aria-hidden="true" className="absolute -right-1 top-[206px] h-24 w-[5px] rounded-r-[3px] bg-[linear-gradient(270deg,#1a1a1a,#5a5a5a_60%,#2a2a2a)]" />

        <div className="relative h-full w-full rounded-[57px] bg-[#050505] p-2.5 shadow-[inset_0_0_0_1px_#3a3a3a]">
          <div className="vv-screen relative flex h-full w-full flex-col overflow-hidden rounded-[47px] bg-[#0b0b0b]">
            <div aria-hidden="true" className="absolute left-1/2 top-2.5 z-[5] -ml-14 flex h-[33px] w-28 items-center justify-end rounded-[20px] bg-black pr-[13px]">
              <span className="h-[11px] w-[11px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a63_0%,#121826_45%,#05070b_100%)]" />
            </div>

            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[4] flex h-[52px] items-center justify-between pl-[34px] pr-[30px] pt-1.5 text-sm font-semibold tracking-[-0.01em] text-[#f5f5f4]">
              <span>9:41</span>
              <span className="flex items-center gap-[5px]">
                <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#F5F5F4" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#F5F5F4" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#F5F5F4" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#F5F5F4" /></svg>
                <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="#F5F5F4" strokeOpacity=".45" /><rect x="2" y="2" width="16" height="8" rx="2" fill="#F5F5F4" /><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill="#F5F5F4" fillOpacity=".45" /></svg>
              </span>
            </div>

            <div className="flex items-center gap-[9px] border-b border-[#1f1f1f] bg-[#121212] px-3 pb-2.5 pt-[54px]">
              <span className="flex items-center gap-0.5 text-sm text-[#2bd47d]">
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path d="M11.5 3.5 6 9l5.5 5.5" fill="none" stroke={VERDE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                12
              </span>
              <span aria-hidden="true" className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[linear-gradient(145deg,#2a8f5b,#1f7a4a)] text-xs font-bold text-[#f5f5f4]">UBS</span>
              <div className="min-w-0 flex-1 leading-[1.25]">
                <div className="flex items-center gap-[5px] text-[15px] font-semibold text-[#f5f5f4]">
                  UBS Centro
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.5" fill={VERDE} /><path d="M4.2 7.2l1.9 1.9 3.8-4" fill="none" stroke="#0B0B0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="text-[11.5px] text-[#9a9a99]">Conta comercial</div>
              </div>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="2" y="6" width="12" height="10" rx="2.5" fill="none" stroke={VERDE} strokeWidth="1.6" /><path d="M14 10l5-3v8l-5-3" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinejoin="round" /></svg>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 3.5h2.2l1.2 3.4-1.6 1.1a9 9 0 0 0 4.7 4.7l1.1-1.6 3.4 1.2v2.2a1.6 1.6 0 0 1-1.7 1.6A13 13 0 0 1 3.9 5.2a1.6 1.6 0 0 1 1.6-1.7z" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinejoin="round" /></svg>
            </div>

            <div className="vv-wall flex flex-1 flex-col gap-1.5 overflow-hidden px-3.5 py-3 text-[#f5f5f4]">
              <span className="mb-0.5 self-center rounded-lg bg-[#161616] px-2.5 py-[3px] text-[11px] font-medium text-[#9a9a99]">Hoje</span>
              <span className="mb-1.5 max-w-[92%] self-center rounded-lg bg-[#161616] px-2.5 py-1 text-center text-[10.5px] text-[#9a9a99]">As mensagens desta conta são verificadas.</span>
              <Recebida atraso="vv-m1" horario="09:12" cauda>Oi, Ana! Aqui é da UBS Centro. Sua consulta de clínica geral com a Dra. Lima está marcada para quinta, às 8h30.</Recebida>
              <div className="vv-msg vv-m2 w-[84%] self-start overflow-hidden rounded-[14px] bg-[#1e2321] shadow-[0_1px_0_rgba(0,0,0,.4)]">
                <div className="px-[11px] pb-[5px] pt-2 text-[13.5px] leading-[1.42]">
                  Você consegue vir?
                  <span className="mt-px block text-right text-[10.5px] text-[#9a9a99]">09:12</span>
                </div>
                <BotaoResposta>Confirmar presença</BotaoResposta>
                <BotaoResposta>Não vou conseguir</BotaoResposta>
              </div>
              <Enviada atraso="vv-m3" horario="09:40" cauda>Não vou conseguir</Enviada>
              <Enviada atraso="vv-m4" horario="09:40">Me chamaram pra trabalhar nesse dia, desculpa</Enviada>
              <Recebida atraso="vv-m5" horario="09:41" cauda>Sem problema, obrigada por avisar! Sua vaga vai para outro paciente que está esperando. A recepção te liga para remarcar.</Recebida>
            </div>

            <div className="flex items-center gap-2 border-t border-[#1f1f1f] bg-[#121212] px-2.5 pb-7 pt-2">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke={VERDE} strokeWidth="1.8" strokeLinecap="round" /></svg>
              <div className="flex h-9 flex-1 items-center justify-between rounded-[18px] border border-[#2a2a2a] bg-[#1c1c1c] px-3 text-[13.5px] text-[#797978]">
                Mensagem
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="#797978" strokeWidth="1.3" /><path d="M5.5 9.5a3 3 0 0 0 5 0" fill="none" stroke="#797978" strokeWidth="1.3" strokeLinecap="round" /><circle cx="6" cy="6.5" r=".8" fill="#797978" /><circle cx="10" cy="6.5" r=".8" fill="#797978" /></svg>
              </div>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 7.5h3l1.5-2h7l1.5 2h3v10H3z" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinejoin="round" /><circle cx="11" cy="12" r="3" fill="none" stroke={VERDE} strokeWidth="1.6" /></svg>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="8" y="3" width="6" height="11" rx="3" fill="none" stroke={VERDE} strokeWidth="1.6" /><path d="M5 11a6 6 0 0 0 12 0M11 17v2.5" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinecap="round" /></svg>
            </div>
            <span aria-hidden="true" className="absolute bottom-2 left-1/2 z-[6] -ml-16 h-[5px] w-32 rounded-[5px] bg-[#f5f5f4] opacity-85" />
          </div>
        </div>
      </div>
    </div>
  )
}