import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CampoData } from '../components/CampoData'
import { Combo } from '../components/Combo'
import { Aviso, Carregando, ErroTela, Vazio, type DadosAviso } from '../components/Estados'
import { Opcoes } from '../components/Formulario'
import { IconeAtualizar, IconeCalendario, IconeInfo, IconeMais, IconeTelefone } from '../components/Icones'
import { BotaoRisco } from '../components/PorQueRisco'
import { SeloStatus } from '../components/Selos'
import { useAuth } from '../context/AuthContext'
import { INTERVALO_ATUALIZACAO, useAsync } from '../hooks/useAsync'
import { useRelogio } from '../hooks/useRelogio'
import { cancelarConsulta, confirmarConsulta, liberarConsulta, listarConsultas, listarFila, listarProfissionais, listarUnidades, registrarPresenca } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { AcaoConsulta, Consulta } from '../types'
import { agoraIso, CANAIS, diaPorExtenso, hojeIso, hora, relogioTexto, resumoRisco, riscoPercentual, semanaLonga } from '../utils/formatos'

type FiltroRisco = 'todos' | 'ALTO' | 'MEDIO' | 'BAIXO'
type Ordem = 'hora' | 'risco'

const FILTROS: { id: FiltroRisco; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'ALTO', label: 'Risco alto' },
  { id: 'MEDIO', label: 'Médio' },
  { id: 'BAIXO', label: 'Baixo' },
]

const ORDENS: { id: Ordem; label: string }[] = [
  { id: 'hora', label: 'Horário' },
  { id: 'risco', label: 'Risco' },
]

const BOTAO = 'inline-flex h-11 w-[116px] items-center justify-center whitespace-nowrap rounded-full border bg-transparent text-[13px] transition-colors hover:bg-surface disabled:opacity-50'

function Numero({ rotulo, valor, cor = '' }: { rotulo: string; valor: number; cor?: string }) {
  return (
    <div className="rounded-[20px] border border-line p-5 sm:p-6">
      <div className="text-[13.5px] text-muted">{rotulo}</div>
      <div className={`mt-1 text-[30.6px] font-light tracking-[-0.03em] ${cor}`}>{valor}</div>
    </div>
  )
}

function ItemMenu({ children, onClick, disabled, cor = '' }: { children: ReactNode; onClick: () => void; disabled?: boolean; cor?: string }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onClick} className={`vv-menu-item flex min-h-11 w-full items-center rounded-[10px] px-3 text-left text-[14px] disabled:opacity-50 ${cor}`}>
      {children}
    </button>
  )
}

const devolvida = (c: Consulta) => c.status === 'LIBERADA' || c.status === 'CANCELADA'
const aberta = (c: Consulta) => c.status === 'AGENDADA' || c.status === 'CONFIRMADA'

export default function Agenda() {
  const { usuario } = useAuth()
  const relogio = useRelogio()
  const agora = agoraIso(relogio)
  const [data, setData] = useState(() => hojeIso())
  const [unidade, setUnidade] = useState<string>(String(usuario?.unidade.id ?? 'todas'))
  const [profissional, setProfissional] = useState('')
  const [filtro, setFiltro] = useState<FiltroRisco>('todos')
  const [ordem, setOrdem] = useState<Ordem>('hora')
  const [aviso, setAviso] = useState<DadosAviso | null>(null)
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [expandida, setExpandida] = useState<number | null>(null)
  const [confirmandoCancelar, setConfirmandoCancelar] = useState<number | null>(null)

  useEffect(() => {
    if (expandida === null) return
    function clique(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-menu-acoes]')) setExpandida(null)
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpandida(null)
    }
    document.addEventListener('mousedown', clique)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', clique)
      document.removeEventListener('keydown', tecla)
    }
  }, [expandida])

  const unidadeId = unidade === 'todas' ? null : Number(unidade)
  const unidades = useAsync(listarUnidades, [])
  const profissionais = useAsync(() => listarProfissionais({ unidade: unidadeId }), [unidadeId])
  const { dados, erro, carregando, recarregar, atualizar } = useAsync(
    async () => {
      const [consultas, ofertas] = await Promise.all([
        listarConsultas({ data, unidade: unidadeId, profissional: profissional ? Number(profissional) : null }),
        listarFila({ unidade: unidadeId, status: 'OFERTADA' }),
      ])
      return { consultas, ofertas }
    },
    [data, unidadeId, profissional],
    INTERVALO_ATUALIZACAO,
  )

  const consultas = useMemo(() => dados?.consultas ?? [], [dados])
  const ofertaDaConsulta = (id: number) => dados?.ofertas.find((o) => o.consultaOfertadaId === id)

  const paraLigar = consultas.filter((c) => c.risco.nivel === 'ALTO' && c.status === 'AGENDADA' && c.dataConsulta > agora)
  const devolvidas = consultas.filter(devolvida)

  const linhas = useMemo(() => {
    const filtradas = consultas.filter((c) => filtro === 'todos' || c.risco.nivel === filtro)
    if (ordem === 'risco') return [...filtradas].sort((a, b) => (b.risco.valor ?? -1) - (a.risco.valor ?? -1))
    return filtradas
  }, [consultas, filtro, ordem])

  async function executar<T>(c: Consulta, acao: () => Promise<T>, depois?: (r: T) => DadosAviso | null) {
    setOcupado(c.id)
    setConfirmandoCancelar(null)
    setExpandida(null)
    try {
      const resposta = await acao()
      setAviso(depois ? depois(resposta) : null)
      atualizar()
    } catch (e) {
      setAviso({ titulo: 'Não foi possível concluir a ação.', texto: mensagemDeErro(e), tipo: 'erro' })
    } finally {
      setOcupado(null)
    }
  }

  const avisoDeVaga = (c: Consulta) => (r: AcaoConsulta): DadosAviso =>
    r.oferta
      ? { titulo: `Vaga das ${hora(c.dataConsulta)} oferecida a ${r.oferta.paciente.nome}`, texto: `Classe ${r.oferta.classeRisco}, ${r.oferta.pontuacao} pontos.${r.oferta.respondaAte ? ` Responde até as ${hora(r.oferta.respondaAte)}.` : ''} É o próximo compatível da fila.` }
      : { titulo: `Vaga das ${hora(c.dataConsulta)} devolvida`, texto: 'Ninguém compatível na fila agora. O horário fica livre para encaixe.', tipo: 'neutro' }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 text-[15px] uppercase tracking-[0.12em] text-muted">
            <span>{semanaLonga(data)} · {diaPorExtenso(data)}</span>
            <time className="tabular-nums tracking-normal text-accent-text">{relogioTexto(relogio)}</time>
          </div>
          <h1 className="mb-0 mt-2 text-[clamp(25.6px,2.7vw,34.3px)] font-light tracking-[-0.03em]">Agenda do dia</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={recarregar} className="vv-ghost"><IconeAtualizar />Atualizar</button>
          <Link to="/consultas/nova" className="vv-primary !min-h-11 !px-5 !text-sm"><IconeMais />Nova consulta</Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Opcoes rotulo="Unidade" valor={unidade} onEscolher={(v) => { setUnidade(v); setProfissional('') }} opcoes={[{ id: 'todas', label: 'Todas' }, ...(unidades.dados ?? []).map((u) => ({ id: String(u.id), label: u.nome }))]} />
        <div className="w-full sm:w-[250px]">
          <label htmlFor="a-prof" className="sr-only">Profissional</label>
          <Combo id="a-prof" compacto valor={profissional} onChange={setProfissional} opcoes={[{ valor: '', rotulo: 'Todos os profissionais' }, ...(profissionais.dados ?? []).map((p) => ({ valor: String(p.id), rotulo: p.nome }))]} />
        </div>
        <div className="w-full sm:w-[170px]">
          <label htmlFor="a-data" className="sr-only">Data</label>
          <CampoData id="a-data" compacto valor={data} onChange={(v) => v && setData(v)} />
        </div>
      </div>

      <div className="mb-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Numero rotulo="Consultas no dia" valor={consultas.length} />
        <Numero rotulo="Risco alto a contatar" valor={paraLigar.length} cor="text-danger-text" />
        <Numero rotulo="Confirmadas" valor={consultas.filter((c) => c.status === 'CONFIRMADA').length} cor="text-accent-text" />
        <Numero rotulo="Vagas devolvidas à fila" valor={devolvidas.length} />
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="Consultas" className="min-w-0 flex-[999_1_640px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Opcoes rotulo="Filtrar por risco" opcoes={FILTROS} valor={filtro} onEscolher={setFiltro} />
            <div className="flex items-center gap-2.5">
              <span className="text-[13.5px] text-text">Ordenar por</span>
              <Opcoes rotulo="Ordenar" opcoes={ORDENS} valor={ordem} onEscolher={setOrdem} />
            </div>
          </div>

          {aviso && <div className="mb-3.5"><Aviso aviso={aviso} onFechar={() => setAviso(null)} /></div>}

          {carregando && <Carregando texto="Buscando consultas…" />}
          {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar a agenda." erro={erro} onTentar={recarregar} />}
          {!carregando && erro === null && linhas.length === 0 && (
            <Vazio icone={<IconeCalendario />} titulo={consultas.length === 0 ? 'Nenhuma consulta neste dia.' : 'Nenhuma consulta com esse filtro.'}>
              {consultas.length > 0 ? <button type="button" onClick={() => setFiltro('todos')} className="vv-ghost">Mostrar todas</button> : <Link to="/consultas/nova" className="vv-ghost">Agendar consulta</Link>}
            </Vazio>
          )}

          {!carregando && erro === null && linhas.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {linhas.map((c) => {
                const passou = c.dataConsulta <= agora
                const faltamMenosDe24h = new Date(`${c.dataConsulta}-03:00`).getTime() - relogio.getTime() < 24 * 3600 * 1000
                const oferta = ofertaDaConsulta(c.id)
                const trava = ocupado === c.id
                const canal = c.paciente.canalContato ? CANAIS[c.paciente.canalContato] : 'canal preferido'
                const aberto = expandida === c.id
                const encerrada = c.status === 'REALIZADA' || c.status === 'FALTA'
                return (
                  <article key={c.id} className={`vv-rowlink rounded-[18px] border border-line bg-bg ${encerrada ? 'opacity-70' : ''} ${aberto ? 'relative z-20' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5">
                      <span className="w-14 text-[17px] tabular-nums">{hora(c.dataConsulta)}</span>
                      <div className="min-w-0 flex-[1_1_240px]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link to={`/consultas/${c.id}`} className="text-base font-medium !text-text no-underline hover:underline">{c.paciente.nome}</Link>
                          <SeloStatus status={c.status} />
                        </div>
                        <div className="mt-0.5 text-[13.5px] text-muted">{c.profissional.especialidade} · {c.profissional.nome}</div>
                        <div className="mt-1 flex items-start gap-1.5 text-[13px] text-muted"><span className="mt-[3px] flex-none"><IconeInfo /></span>{resumoRisco(c.risco)}</div>
                        <div className="mt-0.5 text-[13px] text-muted">Contato por {canal}{c.paciente.primeiraConsulta ? ' · primeira consulta' : ''}</div>
                        {oferta && <div className="mt-1 flex items-center gap-2 text-[13px]"><span className="h-[7px] w-[7px] flex-none rounded-full bg-accent" />Oferecida a {oferta.paciente.nome}</div>}
                      </div>
                      <BotaoRisco consulta={c} />
                      <div className="flex w-full items-center justify-end gap-2 sm:w-auto lg:w-[240px]">
                        {c.status === 'AGENDADA' && !passou && <button type="button" disabled={trava} onClick={() => executar(c, () => confirmarConsulta(c.id))} className={`${BOTAO} border-accent-deep text-accent-text`}>Confirmar</button>}
                        <div data-menu-acoes={aberto ? '' : undefined} className="relative">
                          <button type="button" aria-haspopup="menu" aria-expanded={aberto} aria-label={`Ações de ${c.paciente.nome}`} onClick={() => { setExpandida(aberto ? null : c.id); setConfirmandoCancelar(null) }} className={`${BOTAO} gap-2 border-line text-text`}>
                            Ações
                            <svg className={`transition-transform ${aberto ? 'rotate-180' : ''}`} width="10" height="7" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          {aberto && (
                            <div role="menu" className="vv-menu vv-drop absolute right-0 top-full z-30 mt-1.5 w-[216px] p-1.5">
                              {aberta(c) && passou && <ItemMenu disabled={trava} cor="text-accent-text" onClick={() => executar(c, () => registrarPresenca(c.id, true))}>Compareceu</ItemMenu>}
                              {aberta(c) && passou && <ItemMenu disabled={trava} cor="text-danger-text" onClick={() => executar(c, () => registrarPresenca(c.id, false))}>Faltou</ItemMenu>}
                              {c.status === 'AGENDADA' && !passou && faltamMenosDe24h && <ItemMenu disabled={trava} onClick={() => executar(c, () => liberarConsulta(c.id), avisoDeVaga(c))}>Liberar vaga</ItemMenu>}
                              {aberta(c) && !passou && (confirmandoCancelar === c.id
                                ? <ItemMenu disabled={trava} cor="text-danger-text" onClick={() => executar(c, () => cancelarConsulta(c.id), avisoDeVaga(c))}>Confirmar cancelamento</ItemMenu>
                                : <ItemMenu disabled={trava} onClick={() => setConfirmandoCancelar(c.id)}>Cancelar consulta</ItemMenu>)}
                              <Link role="menuitem" to={`/consultas/${c.id}`} className="vv-menu-item flex min-h-11 items-center rounded-[10px] px-3 text-[14px] !text-text no-underline">Abrir consulta</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <p className="mb-0 mt-4 text-[12.5px] text-muted">Risco alto: acima de 35% · Médio: de 20% a 35% · Baixo: abaixo de 20%</p>
        </section>

        <aside className="flex w-full flex-[1_1_280px] flex-col gap-4">
          <div className="rounded-[22px] border border-danger p-5">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><IconeTelefone className="text-danger-text" />Ligar primeiro</div>
            <div className="mt-3 flex flex-col gap-2">
              {paraLigar.map((c) => (
                <Link key={c.id} to={`/consultas/${c.id}`} className="flex flex-col gap-1 rounded-xl bg-surface px-3 py-2.5 !text-text no-underline">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm">{c.paciente.nome} <span className="text-muted">· {hora(c.dataConsulta)}</span></span>
                    <span className="text-[12.5px] tabular-nums">{riscoPercentual(c.risco)}%</span>
                  </span>
                  <span className="text-[12.5px] text-muted">{resumoRisco(c.risco)}</span>
                </Link>
              ))}
              {paraLigar.length === 0 && <div className="text-[13.5px] text-muted">Ninguém de risco alto sem confirmação.</div>}
            </div>
          </div>
          <div className="rounded-[22px] border border-line p-5">
            <div className="text-[15px] font-semibold">Vagas devolvidas</div>
            <div className="mt-3 flex flex-col gap-2">
              {devolvidas.map((c) => {
                const oferta = ofertaDaConsulta(c.id)
                return (
                  <div key={c.id} className="flex items-start gap-2.5 rounded-xl bg-surface p-3">
                    <span className={`mt-[7px] h-2 w-2 flex-none rounded-full ${oferta ? 'bg-accent' : 'bg-mid'}`} />
                    <span className="text-sm"><span className="tabular-nums">{hora(c.dataConsulta)}</span> · {oferta ? `Oferecida a ${oferta.paciente.nome}` : 'Livre para encaixe'}</span>
                  </div>
                )
              })}
              {devolvidas.length === 0 && <div className="text-[13.5px] text-muted">Nenhuma vaga devolvida neste dia.</div>}
            </div>
            <Link to="/lista-espera" className="mt-3 inline-block text-[13.5px]">Ver lista de espera</Link>
          </div>
        </aside>
      </div>
    </>
  )
}
