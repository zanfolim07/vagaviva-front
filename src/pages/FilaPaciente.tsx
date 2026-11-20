import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Carregando, ErroTela, Spinner } from '../components/Estados'
import { IconeCheck } from '../components/Icones'
import { CartaoSituacao, TopoPaciente } from '../components/Layouts'
import { INTERVALO_ATUALIZACAO, useAsync } from '../hooks/useAsync'
import { aceitarFila, filaPublica, mesmoDiaFila, recusarFila, sairDaFila } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import type { EtapaFila, FilaPublica } from '../types'
import { agoraIso, dataCompleta, dataCurta, hojeIso, hora, horaFalada, semanaLonga } from '../utils/formatos'

const BOTAO = 'min-h-14 rounded-[18px] text-[17px] transition-transform active:scale-[.98] disabled:opacity-60'
const ORDEM: EtapaFila[] = ['NA_FILA', 'VAGA_OFERECIDA', 'CONSULTA_MARCADA']

function Etapas({ f }: { f: FilaPublica }) {
  const atual = ORDEM.indexOf(f.etapaAtual)
  const lista = [
    { t: 'Pedido recebido', s: `Há ${f.diasEspera} dias` , estado: 'ok' as const },
    { t: 'Na fila de espera', s: f.etapaAtual === 'NA_FILA' && f.posicao ? `Você está aqui · ${f.posicao}º lugar` : 'Etapa concluída', estado: atual === 0 ? ('atual' as const) : ('ok' as const) },
    { t: 'Vaga oferecida', s: 'Avisamos quando abrir', estado: atual === 1 ? ('atual' as const) : atual > 1 ? ('ok' as const) : ('prox' as const) },
    { t: 'Consulta marcada', s: 'Você confirma pelo celular', estado: atual === 2 ? ('atual' as const) : ('prox' as const) },
    { t: 'Atendimento', s: `Na ${f.unidade}`, estado: 'prox' as const },
  ]
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {lista.map((e, i) => {
        const ok = e.estado === 'ok'
        const emCurso = e.estado === 'atual'
        return (
          <li key={e.t} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 text-left">
            <span className="flex flex-col items-center">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-xs font-bold ${ok ? 'border-accent-text bg-accent text-[#0b0b0b]' : emCurso ? 'border-accent-text text-accent-text' : 'border-line text-muted'}`}>{ok ? '✓' : i + 1}</span>
              <span className={`min-h-4 w-[1.5px] flex-1 ${i === lista.length - 1 ? 'bg-transparent' : ok ? 'bg-accent' : 'bg-line'}`} />
            </span>
            <span className="pb-3.5">
              <span className={`block text-[14.5px] ${emCurso ? 'font-semibold' : ''} ${ok || emCurso ? 'text-text' : 'text-muted'}`}>{e.t}</span>
              <span className="block text-[12.5px] text-muted">{e.s}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function FilaPaciente() {
  const { token = '' } = useParams()
  const [enviando, setEnviando] = useState(false)
  const [erroAcao, setErroAcao] = useState('')
  const [recusou, setRecusou] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)
  const [atualizada, setAtualizada] = useState<FilaPublica | null>(null)
  const { dados, erro, carregando, recarregar } = useAsync(() => filaPublica(token), [token], INTERVALO_ATUALIZACAO)

  async function agir(acao: () => Promise<FilaPublica>, depois?: () => void) {
    setEnviando(true)
    setErroAcao('')
    try {
      setAtualizada(await acao())
      depois?.()
    } catch (e) {
      setErroAcao(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <><TopoPaciente /><div className="mt-9"><Carregando texto="Buscando sua fila…" linhas={2} altura="h-40" /></div></>
  if (erro instanceof HttpError && erro.status === 404) {
    return (
      <>
        <TopoPaciente />
        <CartaoSituacao circulo={null}>
          <div className="text-[23.8px] font-light tracking-[-0.03em]">Link inválido ou expirado</div>
          <div className="max-w-[300px] text-base text-muted">Peça um novo link à sua unidade de saúde.</div>
        </CartaoSituacao>
      </>
    )
  }
  if (erro !== null || !dados) return <><TopoPaciente /><div className="mt-9"><ErroTela titulo="Não foi possível carregar sua fila." erro={erro} onTentar={recarregar} /></div></>

  const f = atualizada ?? dados
  const oferta = f.oferta
  const ofertaHoje = oferta?.dataConsulta.slice(0, 10) === hojeIso()
  const prazoValido = oferta?.respondaAte && oferta.respondaAte > agoraIso()

  return (
    <>
      <TopoPaciente unidade={f.unidade} />

      {recusou && f.etapaAtual === 'NA_FILA' && (
        <CartaoSituacao circulo={<span className="vv-pop flex h-[88px] w-[88px] items-center justify-center rounded-full border-[1.5px] border-accent-text text-[28px] font-light text-accent-text">{f.posicao}º</span>}>
          <div className="vv-rise text-[23.8px] font-light tracking-[-0.03em]">Tudo bem, {f.primeiroNome}</div>
          <div className="vv-rise max-w-[300px] text-base text-muted">Você continua na fila, no mesmo lugar. Avisamos quando abrir outra vaga.</div>
          <button type="button" onClick={() => setRecusou(false)} className="vv-ghost mt-2 !text-muted">Ver minha fila</button>
        </CartaoSituacao>
      )}

      {!recusou && f.etapaAtual === 'NA_FILA' && (
        <main className="vv-rise mt-[30px] flex flex-col gap-[18px]">
          <div>
            <h1 className="m-0 text-[25.5px] font-light leading-[1.15] tracking-[-0.03em]">Olá, {f.primeiroNome}.</h1>
            <p className="mb-0 mt-1.5 text-[15.5px] text-muted">Acompanhe aqui sua espera por uma consulta.</p>
          </div>

          <section aria-label="Sua posição" className="rounded-3xl border border-line bg-surface p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] tracking-[0.18em] text-accent-text">SUA POSIÇÃO</div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-[52px] font-light leading-none tracking-[-0.04em] tabular-nums">{f.posicao}º</span>
                  <span className="text-[15px] text-muted">de {f.totalNaFila}</span>
                </div>
              </div>
              {f.variacaoSemana > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-deep px-2.5 py-1 text-[12.5px] font-semibold text-accent-text">
                  subiu {f.variacaoSemana} {f.variacaoSemana === 1 ? 'lugar' : 'lugares'}
                </span>
              )}
            </div>
            <div className="mt-3 text-[15px]">Fila de <strong className="font-semibold">{f.especialidade}</strong> · {f.unidade}</div>
            <div className="mt-4 flex justify-between text-[13px]">
              <span className="tabular-nums">Esperando há {f.diasEspera} dias</span>
              <span className="text-muted">prazo até {dataCompleta(f.prazoAte)}</span>
            </div>
            <div role="img" aria-label={`${f.percentualPrazo}% do prazo máximo já passou`} className="mt-1.5 h-1.5 overflow-hidden rounded-md bg-bg">
              <div className="h-1.5 rounded-md bg-accent" style={{ width: `${Math.min(100, f.percentualPrazo)}%` }} />
            </div>
            <p className="mb-0 mt-3.5 text-[13px] text-muted">Sua posição pode mudar: casos mais graves entram na frente, e quanto mais tempo você espera, mais você sobe. O prazo vem da prioridade que seu médico definiu.</p>
          </section>

          <section aria-labelledby="etapas-t" className="rounded-3xl border border-line p-5">
            <h2 id="etapas-t" className="mb-3.5 mt-0 text-[15px] font-semibold">Seu processo</h2>
            <Etapas f={f} />
          </section>

          <section aria-label="Preferências" className="flex flex-col gap-3.5 rounded-3xl border border-line p-5">
            <div className="flex items-center justify-between gap-3.5">
              <span id="sw-t" className="text-[14.5px] font-medium">Posso ser chamado no mesmo dia</span>
              <button type="button" role="switch" aria-checked={f.aceitaMesmoDia} aria-labelledby="sw-t" disabled={enviando} onClick={() => agir(() => mesmoDiaFila(token, !f.aceitaMesmoDia), () => setSalvo(true))} className={`relative h-[30px] w-[52px] flex-none rounded-[30px] transition-colors ${f.aceitaMesmoDia ? 'bg-accent' : 'bg-line'}`}>
                <span className={`absolute left-[3px] top-[3px] h-6 w-6 rounded-full bg-[#f5f5f4] transition-transform ${f.aceitaMesmoDia ? 'translate-x-[22px]' : ''}`} />
              </button>
            </div>
            <p className="-mt-1.5 mb-0 text-[12.5px] text-muted">Ligado, você também recebe vagas que abrem de última hora. Isso aumenta suas chances.</p>
            {salvo && <p role="status" className="m-0 text-[12.5px] text-accent-text">Preferência salva.</p>}
            <div className="border-t border-line pt-3 text-[13px] text-muted">Mudou de número? Ligue para a UBS.</div>
          </section>

          {erroAcao && <p role="alert" className="vv-err !mt-0 text-center">{erroAcao}</p>}
          {confirmandoSaida ? (
            <div role="group" aria-label="Confirmar saída da fila" className="vv-rise flex flex-col gap-2.5 rounded-[18px] border border-danger p-4">
              <span className="text-[14.5px]">Sair da fila? Seu lugar vai para a próxima pessoa e, se precisar de novo, será um novo pedido.</span>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={enviando} onClick={() => agir(() => sairDaFila(token))} className="min-h-[46px] rounded-[14px] bg-inv-bg text-[14.5px] font-semibold text-inv-fg">Sim, sair</button>
                <button type="button" onClick={() => setConfirmandoSaida(false)} className="min-h-[46px] rounded-[14px] border border-line text-[14.5px] text-text">Continuar</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmandoSaida(true)} className="min-h-12 rounded-2xl border border-line text-[14.5px] text-muted">Não preciso mais da consulta</button>
          )}
        </main>
      )}

      {f.etapaAtual === 'VAGA_OFERECIDA' && oferta && (
        <main className="vv-rise mt-[30px] flex flex-1 flex-col gap-[18px]">
          <div>
            <h1 className="m-0 text-[25.5px] font-light leading-[1.15] tracking-[-0.03em]">{f.primeiroNome}, <span className="font-semibold text-accent-text">abriu uma vaga</span> para você.</h1>
            <p className="mb-0 mt-1.5 text-[15.5px] text-muted">{ofertaHoje ? 'Uma vaga de hoje abriu, e você aceita ser chamado no mesmo dia.' : 'Uma vaga compatível com o seu pedido abriu.'}</p>
          </div>
          <section className="overflow-hidden rounded-3xl border border-accent-deep bg-surface">
            <div className="border-b border-line px-5 pb-[18px] pt-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-accent-text">{ofertaHoje ? 'Hoje · ' : ''}{semanaLonga(oferta.dataConsulta)}</div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span className="text-[35.7px] font-light leading-none tracking-[-0.03em]">{dataCurta(oferta.dataConsulta)}</span>
                <span className="text-[22px] font-light text-muted">{horaFalada(oferta.dataConsulta)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 px-5 py-4 text-[15px]">
              <div>{f.especialidade}{oferta.profissional ? ` · ${oferta.profissional}` : ''}</div>
              <div className="text-muted">{oferta.unidade}</div>
            </div>
          </section>
          {prazoValido && oferta.respondaAte && (
            <div className="flex items-center gap-2.5 text-[13.5px] text-muted">
              <svg className="flex-none" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              Responda até {oferta.respondaAte.slice(0, 10) === hojeIso() ? 'hoje' : dataCurta(oferta.respondaAte)}, às {hora(oferta.respondaAte)}. Depois, a vaga vai para a próxima pessoa.
            </div>
          )}
          <div className="flex-1" />
          {erroAcao && <p role="alert" className="vv-err !mt-0 text-center">{erroAcao}</p>}
          <button type="button" disabled={enviando} onClick={() => agir(() => aceitarFila(token))} className={`${BOTAO} flex items-center justify-center gap-2.5 bg-accent font-semibold text-on-accent`}>{enviando && <Spinner escuro />}Aceitar a vaga</button>
          <button type="button" disabled={enviando} onClick={() => agir(() => recusarFila(token), () => setRecusou(true))} className={`${BOTAO} border border-line text-text`}>Não posso nesse horário</button>
        </main>
      )}

      {f.etapaAtual === 'CONSULTA_MARCADA' && (
        <CartaoSituacao circulo={<span className="vv-pop flex h-[88px] w-[88px] items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={38} /></span>}>
          <div className="vv-rise text-[23.8px] font-light tracking-[-0.03em]">Consulta marcada</div>
          <div className="vv-rise max-w-[300px] text-base text-muted">Sua consulta de {f.especialidade}, na {f.unidade}, está confirmada. Você saiu da fila.</div>
        </CartaoSituacao>
      )}

      {f.etapaAtual === 'SAIU_DA_FILA' && (
        <CartaoSituacao circulo={null}>
          <div className="vv-rise text-[23.8px] font-light tracking-[-0.03em]">Você saiu da fila</div>
          <div className="vv-rise max-w-[300px] text-base text-muted">Obrigado por avisar. Seu lugar já foi passado para a próxima pessoa.</div>
        </CartaoSituacao>
      )}

      <div className="mt-[18px] text-center text-xs text-muted">Dúvidas? Ligue para a {f.unidade}.</div>
    </>
  )
}
