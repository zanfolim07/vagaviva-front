import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Aviso, Carregando, ErroTela, Vazio, type DadosAviso } from '../components/Estados'
import { MotivosRisco } from '../components/PorQueRisco'
import { SeloRisco, SeloStatus } from '../components/Selos'
import { useRelogio } from '../hooks/useRelogio'
import { useAsync } from '../hooks/useAsync'
import { buscarConsulta, buscarPaciente, cancelarConsulta, confirmarConsulta, consultasDoPaciente, liberarConsulta, registrarPresenca } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import type { AcaoConsulta, Consulta } from '../types'
import { agoraIso, cartaoSus, dataCurta, diaCurto, hora, iniciais, NOME_NIVEL, riscoPercentual, telefone } from '../utils/formatos'

function Evento({ texto, quando, cor = 'border border-muted bg-bg' }: { texto: string; quando: string; cor?: string }) {
  return (
    <div className="relative pb-[18px] last:pb-0">
      <span className={`absolute -left-[26px] top-[5px] h-[11px] w-[11px] rounded-full ${cor}`} />
      <div className="text-[14.5px]">{texto}</div>
      <div className="text-xs tabular-nums text-muted">{quando}</div>
    </div>
  )
}

const EVENTO_STATUS: Partial<Record<Consulta['status'], { texto: string; cor: string }>> = {
  CONFIRMADA: { texto: 'Presença confirmada', cor: 'bg-accent-text' },
  CANCELADA: { texto: 'Consulta cancelada e vaga devolvida à fila', cor: 'bg-mid' },
  LIBERADA: { texto: 'Vaga liberada pela recepção', cor: 'bg-mid' },
  REALIZADA: { texto: 'Paciente compareceu', cor: 'bg-accent-text' },
  FALTA: { texto: 'Paciente faltou', cor: 'bg-danger' },
}

const BOTAO = 'min-h-[50px] rounded-[14px] text-[15px] disabled:opacity-60'

export default function ConsultaDetalhe() {
  const { id } = useParams()
  const numero = Number(id)
  const relogio = useRelogio()
  const [aviso, setAviso] = useState<DadosAviso | null>(null)
  const [perguntando, setPerguntando] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  const { dados, erro, carregando, recarregar, atualizar } = useAsync(async () => {
    const consulta = await buscarConsulta(numero)
    const [paciente, historico] = await Promise.all([buscarPaciente(consulta.paciente.id), consultasDoPaciente(consulta.paciente.id)])
    return { consulta, paciente, historico }
  }, [numero])

  if (carregando) return <Carregando texto="Buscando a consulta…" linhas={3} altura="h-40" />
  if (erro instanceof HttpError && (erro.status === 404 || erro.status === 400)) {
    return <Vazio titulo="Esta consulta não existe mais." texto="Ela pode ter sido removida."><Link to="/agenda" className="vv-ghost">Voltar para a agenda</Link></Vazio>
  }
  if (erro !== null || !dados) return <ErroTela titulo="Não foi possível carregar a consulta." erro={erro} onTentar={recarregar} />

  const { consulta: c, paciente, historico } = dados
  const pct = riscoPercentual(c.risco)
  const agora = agoraIso(relogio)
  const passou = c.dataConsulta <= agora
  const aberta = c.status === 'AGENDADA' || c.status === 'CONFIRMADA'
  const menosDe24h = new Date(`${c.dataConsulta}-03:00`).getTime() - relogio.getTime() < 24 * 3600 * 1000
  const encerradas = historico.filter((h) => h.status === 'REALIZADA' || h.status === 'FALTA')
  const compareceu = encerradas.filter((h) => h.status === 'REALIZADA').length
  const eventoStatus = EVENTO_STATUS[c.status]
  const linkPaciente = `${window.location.origin}/celular/${c.tokenPaciente}`
  const primeiroNome = c.paciente.nome.split(' ')[0]

  async function executar<T>(acao: () => Promise<T>, depois: (r: T) => DadosAviso) {
    setOcupado(true)
    setPerguntando(false)
    try {
      const r = await acao()
      setAviso(depois(r))
      atualizar()
    } catch (e) {
      setAviso({ titulo: 'Não foi possível concluir a ação.', texto: mensagemDeErro(e), tipo: 'erro' })
    } finally {
      setOcupado(false)
    }
  }

  const avisoVaga = (r: AcaoConsulta): DadosAviso =>
    r.oferta
      ? { titulo: `Vaga oferecida a ${r.oferta.paciente.nome}`, texto: 'É o próximo compatível da lista de espera.' }
      : { titulo: 'Vaga devolvida', texto: 'Ninguém compatível na fila agora. O horário fica livre para encaixe.', tipo: 'neutro' }

  return (
    <>
      <nav aria-label="Caminho" className="mb-[18px] flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/agenda" className="!text-muted no-underline">Agenda</Link>
        <span aria-hidden="true">/</span>
        <span className="text-text">Consulta {c.id}</span>
      </nav>

      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-[18px]">
          <span aria-hidden="true" className="flex h-16 w-16 flex-none items-center justify-center rounded-full border border-line bg-surface text-[22px] font-light">{iniciais(c.paciente.nome)}</span>
          <div>
            <h1 className="m-0 text-[clamp(24px,2.6vw,31.2px)] font-light tracking-[-0.03em]">{c.paciente.nome}</h1>
            <div className="text-[15px] text-muted">{c.profissional.especialidade} · {c.profissional.nome} · {diaCurto(c.dataConsulta)}, às {hora(c.dataConsulta)}</div>
          </div>
        </div>
        <SeloStatus status={c.status} />
      </div>

      {aviso && <div className="mb-5"><Aviso aviso={aviso} onFechar={() => setAviso(null)} /></div>}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
          <section className="rounded-[26px] border border-line p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11.5px] tracking-[0.18em] text-muted">RISCO DE FALTA · CALCULADO NO AGENDAMENTO</span>
              <SeloRisco risco={c.risco} comPercentual={false} />
            </div>
            {pct !== null ? (
              <>
                <div className="mt-2.5 flex items-baseline gap-3.5">
                  <span className="text-[47.6px] font-light leading-none tracking-[-0.04em]">{pct}%</span>
                  <span className="text-[15px] text-muted">de chance de falta</span>
                </div>
                <div className="relative mt-4 h-2 rounded-lg bg-line">
                  <div className={`vv-bar h-2 rounded-lg ${c.risco.nivel === 'ALTO' ? 'bg-danger' : c.risco.nivel === 'MEDIO' ? 'bg-mid' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
                  <span className="absolute -top-1 left-[20%] h-4 w-px bg-muted" />
                  <span className="absolute -top-1 left-[35%] h-4 w-px bg-muted" />
                </div>
                <div className="relative mt-1.5 h-4 text-[11px] tabular-nums text-muted">
                  <span className="absolute left-0">0%</span>
                  <span className="absolute left-[20%] -translate-x-1/2">20%</span>
                  <span className="absolute left-[35%] -translate-x-1/2">35%</span>
                  <span className="absolute right-0">100%</span>
                </div>
              </>
            ) : null}
            <div className="mt-[22px]"><MotivosRisco consultaId={c.id} risco={c.risco} /></div>
            <p className="mb-0 mt-4 text-[13.5px] text-muted">{c.acaoSugerida}. A previsão não cancela a consulta: ela só sugere o tipo de contato.</p>
          </section>

          <section className="rounded-[26px] border border-line p-5 sm:p-7">
            <div className="mb-4 text-lg font-medium">Histórico</div>
            <div className="relative pl-[26px]">
              <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
              <Evento texto="Consulta agendada" quando={dataCurta(c.dataAgendamento)} />
              <Evento texto={`Risco ${NOME_NIVEL[c.risco.nivel].toLowerCase()} registrado no agendamento`} quando={dataCurta(c.dataAgendamento)} cor={c.risco.nivel === 'ALTO' ? 'bg-danger' : undefined} />
              <Evento texto={c.enviarLembrete ? 'Mensagem de confirmação programada' : 'Sem mensagem de confirmação'} quando={dataCurta(c.dataAgendamento)} />
              {eventoStatus && <Evento texto={eventoStatus.texto} quando="situação atual" cor={eventoStatus.cor} />}
            </div>
          </section>
        </div>

        <aside className="flex w-full flex-[1_1_320px] flex-col gap-5">
          <section className="rounded-[26px] border border-line p-[26px]">
            <div className="mb-1.5 text-lg font-medium">Ações</div>
            {perguntando ? (
              <div role="alertdialog" aria-label="Confirmar cancelamento" className="vv-rise mt-3 rounded-2xl border border-danger p-[18px]">
                <div className="text-[15.5px] font-semibold">Cancelar a consulta de {primeiroNome}?</div>
                <div className="mt-1 text-sm text-muted">O sistema indica o próximo compatível da lista de espera para receber a vaga.</div>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <button type="button" disabled={ocupado} onClick={() => executar(() => cancelarConsulta(c.id), avisoVaga)} className="min-h-11 rounded-xl bg-danger px-4 text-sm font-semibold text-on-accent">Sim, cancelar</button>
                  <button type="button" onClick={() => setPerguntando(false)} className="min-h-11 rounded-xl border border-line px-4 text-sm text-text">Voltar</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {c.status === 'AGENDADA' && !passou && <button type="button" disabled={ocupado} onClick={() => executar(() => confirmarConsulta(c.id), () => ({ titulo: 'Presença confirmada' }))} className={`${BOTAO} bg-accent font-semibold text-on-accent`}>Confirmar presença</button>}
                {aberta && !passou && <button type="button" disabled={ocupado} onClick={() => setPerguntando(true)} className={`${BOTAO} border border-danger text-text`}>Cancelar consulta</button>}
                <a href={`tel:${paciente.telefone}`} className={`${BOTAO} flex items-center justify-center border border-line !text-text no-underline`}>Ligar para {primeiroNome}</a>
                {c.status === 'AGENDADA' && !passou && menosDe24h && <button type="button" disabled={ocupado} onClick={() => executar(() => liberarConsulta(c.id), avisoVaga)} className={`${BOTAO} border border-line text-text`}>Liberar vaga (sem resposta)</button>}
                {aberta && passou && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" disabled={ocupado} onClick={() => executar(() => registrarPresenca(c.id, true), () => ({ titulo: 'Comparecimento registrado' }))} className={`${BOTAO} border border-accent-deep text-accent-text`}>Compareceu</button>
                    <button type="button" disabled={ocupado} onClick={() => executar(() => registrarPresenca(c.id, false), () => ({ titulo: 'Falta registrada' }))} className={`${BOTAO} border border-danger text-danger-text`}>Faltou</button>
                  </div>
                )}
                <p className="mb-0 mt-0.5 text-[12.5px] text-muted">A recepção só libera a vaga a menos de 24 horas, quando o paciente não respondeu. Presença ou falta são registradas a partir do horário da consulta.</p>
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-line p-[26px]">
            <div className="text-lg font-medium">Paciente</div>
            <div className="mt-2.5 flex flex-col text-[14.5px]">
              <div className="flex justify-between gap-3 border-b border-line py-2.5"><span className="text-muted">Cartão SUS</span><span className="tabular-nums">{cartaoSus(paciente.cartaoSus)}</span></div>
              <div className="flex justify-between gap-3 border-b border-line py-2.5"><span className="text-muted">Telefone</span><span>{telefone(paciente.telefone)}</span></div>
              <div className="flex justify-between gap-3 py-2.5"><span className="text-muted">Últimas consultas</span><span>{encerradas.length === 0 ? 'Sem histórico' : `${compareceu} de ${encerradas.length} compareceu`}</span></div>
            </div>
          </section>

          <section className="flex items-center gap-[18px] rounded-[26px] border border-accent-deep p-[26px]">
            <div className="flex-none rounded-xl bg-white p-2">
              <QRCodeSVG value={linkPaciente} size={76} title="QR Code do link do paciente" />
            </div>
            <div className="min-w-0">
              <div className="text-[15.5px] font-medium">Tela do paciente</div>
              <div className="mb-2 mt-1 text-[13.5px] text-muted">O link que {primeiroNome} recebe para confirmar ou desmarcar.</div>
              <Link to={`/celular/${c.tokenPaciente}`} className="text-sm">Abrir tela do paciente</Link>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
