import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Barras } from '../components/Barras'
import { CelularHome } from '../components/CelularHome'
import { DemoPassos } from '../components/DemoPassos'
import { Carregando, ErroTela, Vazio } from '../components/Estados'
import { Combo } from '../components/Combo'
import { Campo } from '../components/Formulario'
import { IconeCheck, IconeMais20, IconeSeta } from '../components/Icones'
import { MUNICIPIOS } from '../data/municipios'
import { INTERVALO_ATUALIZACAO, useAsync } from '../hooks/useAsync'
import { buscarPainelPublico } from '../services/api'
import type { Painel } from '../types'
import { EMAIL_VALIDO, moeda, percentual } from '../utils/formatos'

const H2 = 'text-[clamp(28.8px,3.5vw,45.2px)] font-light leading-[1.06] tracking-[-0.035em]'
const LABEL_FONTE = 'text-[11.5px] tabular-nums !text-muted'
const POD = 'https://www.poder360.com.br/poder-saude/sao-paulo-adota-whatsapp-para-confirmacao-de-consultas-medicas/'
const SCIELO = 'https://scielosp.org/pdf/sdeb/2019.v43n123/1015-1030/pt'

const NUMEROS = [
  { n: '1 em 4', t: 'consultas agendadas na cidade de São Paulo termina em falta.', f: 'Secretaria Municipal da Saúde, 2025 ↗', u: POD, perigo: true },
  { n: '38,6%', t: 'de faltas em consultas especializadas na Grande Vitória (ES).', f: 'Saúde em Debate, 2019 ↗', u: SCIELO },
  { n: 'R$ 3,56 mi', t: 'em consultas pagas e não realizadas na mesma região, de 2014 a 2016.', f: 'Saúde em Debate, 2019 ↗', u: SCIELO },
]

const COMPARA = [
  ['Quem recebe atenção', 'Todos igual', 'Mais esforço para quem tem risco alto'],
  ['Vaga cancelada', 'Fica vazia ou volta à fila na mão', 'Oferecida na hora ao próximo da fila'],
  ['Por que faltam', 'Ninguém sabe', 'Motivo de cada risco e perfis de faltosos'],
  ['Resultado', 'Não é medido', 'Vagas recuperadas em reais no painel'],
]

const PUBLICOS = [
  { rotulo: 'PACIENTE', titulo: 'Confirma ou desmarca em um toque.', itens: ['Recebe data, horário e local por mensagem', 'Avisa que não vai sem precisar ir até a UBS', 'Quem está na fila é chamado mais cedo'], icone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
  { rotulo: 'RECEPÇÃO', titulo: 'Sabe para quem ligar primeiro.', itens: ['Agenda do dia em ordem de risco', 'O motivo de cada risco, em linguagem simples', 'Vaga liberada vai sozinha para a fila'], icone: <><rect x="3.5" y="4.5" width="17" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4M7.5 13.5h4M7.5 16.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
  { rotulo: 'GESTÃO E SECRETARIA', titulo: 'Prova o resultado com números.', itens: ['Taxa de faltas acompanhada de perto', 'Vagas recuperadas e o valor em reais', 'Faltas por especialidade, para ajustar a agenda'], icone: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> },
]

const CONFIANCA = [
  { t: 'Nunca cancela uma consulta', d: 'O risco só define o tipo de contato. Nenhum paciente perde a vaga por causa de uma previsão.', i: <><path d="M14 3 5 6.5v7c0 5.5 3.8 9.6 9 11.5 5.2-1.9 9-6 9-11.5v-7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 14l3 3 5.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></> },
  { t: 'Mostra o porquê', d: 'Cada risco vem com o motivo. A equipe entende e confere a sugestão antes de agir.', i: <><circle cx="14" cy="14" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 12.5v6M14 9v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></> },
  { t: 'Dados protegidos pela LGPD', d: 'Guarda só o necessário para agendar e confirmar. Nada além disso.', i: <><rect x="6" y="12.5" width="16" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 12.5V9a4.5 4.5 0 0 1 9 0v3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></> },
  { t: 'Não para se algo falhar', d: 'Se a previsão estiver indisponível, a consulta é agendada normalmente e a agenda segue.', i: <><path d="M4 18a7 7 0 0 1 3-13.4A8 8 0 0 1 22 8a5.5 5.5 0 0 1 1 10.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M14 13v10M10.5 19.5 14 23l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></> },
]

const FAQ = [
  ['A IA pode cancelar a consulta de alguém?', 'Não. A vaga só é liberada quando o próprio paciente avisa que não vai ou quando a recepção, depois de tentar contato sem sucesso, decide liberar. A previsão serve para a equipe saber com quem falar primeiro.'],
  ['O paciente precisa instalar algum aplicativo?', 'Não. Ele recebe a mensagem com data, horário e local e responde com um toque.'],
  ['Como a IA sabe quem tem mais chance de faltar?', 'Ela aprendeu com mais de 110 mil consultas reais do SUS. Fatores como antecedência do agendamento, histórico de faltas e se o paciente recebeu lembrete ajudam a estimar o risco.'],
  ['Como a vaga liberada chega a outro paciente?', 'O sistema indica na hora o próximo da lista de espera da mesma especialidade e unidade, e a vaga é oferecida a ele. A ordem soma a gravidade do problema de saúde, definida pelo profissional que fez o pedido, e o tempo de espera: quem espera há meses sobe sozinho, e casos com prazo legal vêm primeiro. Com menos de 24 horas, só entra quem aceita ser chamado no mesmo dia.'],
]

const HORARIOS = 20

function AgendaDoDia({ painel }: { painel: Painel }) {
  const vazios = Math.round(HORARIOS * painel.taxaFalta)
  const vazio = (i: number) => Math.floor(((i + 1) * vazios) / HORARIOS) > Math.floor((i * vazios) / HORARIOS)
  return (
    <div className="mt-[72px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-center gap-8 rounded-[28px] border border-line p-6 sm:p-9">
      <div>
        <div className="text-2xl leading-[1.25] tracking-[-0.02em]">Um dia de agenda com {percentual(painel.taxaFalta, 0)} de faltas.</div>
        <p className="mb-0 mt-2.5 text-[15.5px] text-muted">De {HORARIOS} horários, {vazios} ficam vazios, na taxa atual das unidades atendidas. É exatamente aí que a Vaga Viva atua.</p>
        <div className="mt-5 flex flex-wrap gap-5 text-[13.5px] text-muted">
          <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded bg-accent" />Paciente atendido</span>
          <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded border-[1.5px] border-dashed border-danger" />Horário vazio</span>
        </div>
      </div>
      <div role="img" aria-label={`${HORARIOS} horários: ${HORARIOS - vazios} atendidos e ${vazios} vazios`} className="grid grid-cols-10 gap-2.5">
        {Array.from({ length: HORARIOS }, (_, i) => (
          <span key={i} className={`aspect-square rounded-lg ${vazio(i) ? 'border-[1.5px] border-dashed border-danger' : 'bg-accent'}`} />
        ))}
      </div>
    </div>
  )
}

function Indicador({ rotulo, valor, cor = '' }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <div className="border-b border-r border-line px-6 py-7">
      <div className="text-[13.5px] text-muted">{rotulo}</div>
      <div className={`mt-2 text-[34px] font-light tracking-[-0.03em] ${cor}`}>{valor}</div>
    </div>
  )
}

function PainelDaRede({ painel }: { painel: Painel }) {
  const perdidas = Math.max(painel.vagasDevolvidas - painel.vagasRecuperadas, 0)
  const total = painel.vagasRecuperadas + perdidas
  const pctRecuperadas = total === 0 ? 0 : (painel.vagasRecuperadas / total) * 100
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-bg">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-surface px-6 py-4">
        <span className="text-[14.5px] font-semibold">Painel · todas as unidades</span>
        <span className="rounded-full border border-mid px-3 py-1 text-[11.5px] tabular-nums text-mid">DADOS DE EXEMPLO DO BANCO</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        <Indicador rotulo="Consultas encerradas" valor={String(painel.consultas)} />
        <Indicador rotulo={`Faltas (${percentual(painel.taxaFalta)})`} valor={String(painel.faltas)} cor="text-danger-text" />
        <Indicador rotulo="Vagas recuperadas" valor={String(painel.vagasRecuperadas)} cor="text-accent-text" />
        <Indicador rotulo="Valor preservado" valor={moeda(painel.valorPreservado)} />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))]">
        <div className="border-r border-line px-6 py-7">
          <div className="mb-5 text-base font-medium">Para onde vão as {painel.vagasDevolvidas} vagas devolvidas</div>
          <div role="img" aria-label={`${painel.vagasRecuperadas} vagas recuperadas e ${perdidas} ainda perdidas`} className="flex h-11 gap-0.5 overflow-hidden rounded-xl">
            {painel.vagasRecuperadas > 0 && <div className="vv-bar flex items-center bg-accent pl-3.5 text-[13.5px] font-semibold text-on-accent" style={{ width: `${pctRecuperadas}%` }}>{painel.vagasRecuperadas}</div>}
            <div className="flex flex-1 items-center bg-surface pl-3.5 text-[13.5px] text-muted">{perdidas}</div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-5 text-[13.5px] text-muted">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-[3px] bg-accent" />Recuperadas pela fila</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-[3px] border border-line bg-surface" />Ainda perdidas</span>
          </div>
        </div>
        <div className="px-6 py-7">
          <div className="mb-[18px] text-base font-medium">Taxa de faltas por especialidade</div>
          {painel.porEspecialidade.length === 0 ? (
            <div className="text-sm text-muted">Sem consultas encerradas no período.</div>
          ) : (
            <Barras descricao="Taxa de faltas por especialidade" maximo={1} itens={painel.porEspecialidade.map((e) => ({ rotulo: e.especialidade, valor: e.taxaFalta, texto: percentual(e.taxaFalta, 0) }))} />
          )}
        </div>
      </div>
    </div>
  )
}

interface FormDemo {
  nome: string
  municipio: string
  email: string
}

function FormDemonstracao() {
  const navigate = useNavigate()
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormDemo>({ defaultValues: { nome: '', municipio: '', email: '' } })
  return (
    <form noValidate onSubmit={handleSubmit((dados) => navigate('/contato', { state: dados }))} className="flex flex-col gap-[18px] rounded-[28px] border border-line bg-bg p-6 shadow-[0_40px_100px_-50px_rgba(158,247,200,.4)] sm:p-9">
      <div className="text-[22px] font-medium">Agendar demonstração</div>
      <Campo id="vv-nome" rotulo="Nome" obrigatorio erro={errors.nome?.message}>
        <input id="vv-nome" className="vv-in" autoComplete="name" placeholder="Seu nome" aria-invalid={!!errors.nome} {...register('nome', { validate: (v) => v.trim().length > 1 || 'Informe seu nome.' })} />
      </Campo>
      <Campo id="vv-mun" rotulo="Município">
        <Controller name="municipio" control={control} render={({ field }) => <Combo id="vv-mun" livre opcoes={MUNICIPIOS} placeholder="Digite ou escolha" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
      </Campo>
      <Campo id="vv-mail" rotulo="E-mail institucional" obrigatorio erro={errors.email?.message}>
        <input id="vv-mail" type="email" className="vv-in" autoComplete="email" placeholder="nome@prefeitura.gov.br" aria-invalid={!!errors.email} {...register('email', { validate: (v) => EMAIL_VALIDO.test(v.trim()) || 'Digite um e-mail válido.' })} />
      </Campo>
      <button type="submit" className="vv-primary mt-1 !min-h-14 !text-base">Quero uma demonstração</button>
    </form>
  )
}

export default function Home() {
  const { dados: painel, erro, carregando, recarregar } = useAsync(buscarPainelPublico, [], INTERVALO_ATUALIZACAO)

  return (
    <main>
      <section id="conteudo" className="relative overflow-hidden">
        <div className="vv-dots pointer-events-none absolute inset-0 opacity-55" />
        <div className="relative mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] items-center gap-x-12 gap-y-10 px-4 pb-[88px] pt-20 sm:px-8">
          <div className="flex max-w-[580px] flex-col gap-7">
            <span className="vv-rise self-start text-[13.5px] text-muted">Inteligência artificial para agendas do SUS</span>
            <h1 className="vv-rise vv-d1 m-0 text-[clamp(35.2px,4.5vw,60.8px)] font-light leading-[1.02] tracking-[-0.04em]">Nenhuma consulta vazia enquanto <span className="font-semibold text-accent-text">alguém espera.</span></h1>
            <p className="vv-rise vv-d2 m-0 text-[19px] leading-[1.6] text-muted">A Vaga Viva prevê quais pacientes têm mais chance de faltar, avisa a equipe antes e, quando alguém não pode ir, oferece a vaga na hora para o próximo da fila.</p>
            <div className="vv-rise vv-d3 flex flex-wrap gap-3">
              <Link to="/contato" className="vv-primary !min-h-[54px] !px-7 !text-base">Agendar demonstração<IconeSeta /></Link>
              <a href="#como" className="vv-ghost !min-h-[54px] !bg-bg !px-6 !text-base">Ver como funciona</a>
            </div>
            <div className="vv-rise vv-d4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[18px] border-t border-line pt-6">
              {['Treinada com 110 mil consultas reais do SUS', 'A IA nunca cancela uma consulta', 'Paciente responde por mensagem, sem baixar app'].map((t) => (
                <div key={t} className="flex items-start gap-2.5"><IconeCheck className="mt-[3px] flex-none text-accent-text" /><span className="text-sm leading-[1.4] text-muted">{t}</span></div>
              ))}
            </div>
          </div>

          <div className="vv-stage relative flex flex-col items-center justify-center gap-6 max-sm:-mb-24 min-[1280px]:flex-row min-[1280px]:gap-3.5">
            <div aria-hidden="true" className="pointer-events-none absolute h-[640px] w-[640px] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgba(158,247,200,.34),rgba(158,247,200,.12)_50%,rgba(158,247,200,0)_78%)] blur-2xl" />
            <CelularHome />
            <div className="vv-float relative z-[4] grid w-full max-w-[520px] grid-cols-2 gap-3 min-[1280px]:order-first min-[1280px]:flex min-[1280px]:w-[200px] min-[1280px]:flex-none min-[1280px]:flex-col min-[1280px]:gap-20">
              <div className="vv-msg vv-f1 rounded-[20px] border border-line bg-overlay p-3.5 shadow-[0_18px_44px_-18px_rgba(0,0,0,.75)] backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] bg-accent text-[9px] font-bold text-[#0b0b0b]">VV</span>
                  <span className="flex-1 text-[11.5px] font-medium">Vaga Viva</span>
                  <span className="text-[11px] text-muted">agora</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] tracking-[0.14em] text-muted">RISCO DE FALTA</span>
                  <span className="rounded-full bg-danger px-2 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] text-on-accent">ALTO</span>
                </div>
                <div className="mt-1.5 text-[12.5px] leading-[1.4] text-muted">Agendada há muito tempo e sem lembrete. Equipe avisada para reforçar o contato.</div>
              </div>
              <div className="vv-msg vv-f2 rounded-[20px] border border-line bg-overlay p-3.5 shadow-[0_18px_44px_-18px_rgba(0,0,0,.75)] backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] bg-accent text-[9px] font-bold text-[#0b0b0b]">VV</span>
                  <span className="flex-1 text-[11.5px] font-medium">Vaga Viva</span>
                  <span className="text-[11px] text-muted">agora</span>
                </div>
                <div className="mt-2.5 text-[10.5px] tracking-[0.14em] text-accent-text">VAGA DEVOLVIDA À FILA</div>
                <div className="mt-1.5 text-[13.5px]">Clínica geral · quinta, 8h30</div>
                <div className="mt-0.5 text-[12.5px] leading-[1.4] text-muted">Oferecida a João P., próximo compatível da fila</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problema">
        <div className="mx-auto vv-container px-8 py-28">
          <div className="mb-16 max-w-[760px]">
            <span className="vv-eyebrow">O PROBLEMA</span>
            <h2 className={`my-[18px] ${H2}`}>A fila não anda porque as vagas ficam vazias.</h2>
            <p className="m-0 text-lg text-muted">Paciente que falta sem avisar ocupa um horário que outra pessoa esperava há meses. A unidade paga pelo atendimento que não acontece.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-10">
            {NUMEROS.map((x) => (
              <div key={x.n} className="border-t border-text pt-[22px]">
                <div className={`text-[clamp(41.6px,4vw,56.2px)] font-light leading-none tracking-[-0.04em] ${x.perigo ? 'text-danger-text' : ''}`}>{x.n}</div>
                <p className="mb-3 mt-4 text-[16.5px]">{x.t}</p>
                <a href={x.u} target="_blank" rel="noreferrer" className={LABEL_FONTE}>{x.f}</a>
              </div>
            ))}
          </div>
          {painel && painel.consultas > 0 && <AgendaDoDia painel={painel} />}
        </div>
      </section>

      <section id="como">
        <div className="mx-auto vv-container px-4 py-28 sm:px-8">
          <div className="mb-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-5">
            <div>
              <span className="vv-eyebrow">COMO FUNCIONA</span>
              <h2 className={`mb-0 mt-[18px] ${H2}`}>Da falta prevista ao paciente atendido.</h2>
            </div>
            <p className="m-0 text-lg text-muted">Quatro passos que acontecem sozinhos, todo dia. Clique em cada um para ver a tela que a recepção usa.</p>
          </div>
          <DemoPassos />
        </div>
      </section>

      <section className="bg-paper text-paper-text">
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[72px] gap-y-12 px-4 py-28 sm:px-8">
          <div>
            <span className="text-xs font-medium tracking-[0.24em] text-paper-label">POR QUE A VAGA VIVA</span>
            <h2 className="mb-5 mt-[18px] text-[clamp(28.8px,3.5vw,43.7px)] font-light leading-[1.06] tracking-[-0.035em]">Lembrar todo mundo do mesmo jeito não basta.</h2>
            <p className="mb-4 mt-0 text-lg text-paper-muted">São Paulo já confirma consultas por mensagem. Mesmo assim, uma em cada quatro fica vazia.</p>
            <p className="m-0 text-lg text-paper-muted">A Vaga Viva descobre <strong className="font-semibold text-paper-text">quem</strong> provavelmente vai faltar, age antes e <strong className="font-semibold text-paper-text">não deixa a vaga se perder</strong> quando a falta acontece.</p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-paper-line bg-paper-card">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] text-[13px] tracking-[0.12em]">
              <span className="p-4" />
              <span className="p-4 text-paper-muted2">LEMBRETE COMUM</span>
              <span className="bg-bg p-4 text-accent-text">VAGA VIVA</span>
            </div>
            {COMPARA.map(([a, b, c], i) => (
              <div key={a} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] border-t border-paper-line text-[15px] leading-[1.4] max-sm:text-[13px]">
                <span className="p-[18px] font-semibold max-sm:p-3">{a}</span>
                <span className="p-[18px] text-paper-muted2 max-sm:p-3">{b}</span>
                <span className={`bg-bg p-[18px] text-text max-sm:p-3 ${i > 0 ? 'border-t border-line' : ''}`}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="para-quem">
        <div className="mx-auto vv-container px-8 py-28">
          <div className="mb-14 max-w-[720px]">
            <span className="vv-eyebrow">PARA QUEM</span>
            <h2 className={`mb-0 mt-[18px] ${H2}`}>Cada pessoa da unidade ganha tempo.</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
            {PUBLICOS.map((p) => (
              <div key={p.rotulo} className="vv-lift flex flex-col gap-[18px] rounded-[26px] border border-line p-8">
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line text-accent-text"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">{p.icone}</svg></span>
                <div>
                  <div className="text-xs tracking-[0.18em] text-muted">{p.rotulo}</div>
                  <div className="mt-2 text-2xl leading-[1.25] tracking-[-0.02em]">{p.titulo}</div>
                </div>
                <div className="flex flex-col gap-3 text-[15px] text-muted">
                  {p.itens.map((t) => <span key={t} className="flex gap-2.5"><span className="text-accent-text">—</span>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="painel" className="relative overflow-hidden">
        <div className="mx-auto vv-container px-4 py-28 sm:px-8">
          <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-5">
            <div>
              <span className="vv-eyebrow">PAINEL DA GESTÃO</span>
              <h2 className={`mb-0 mt-[18px] ${H2}`}>Cada vaga recuperada vira economia visível.</h2>
            </div>
            <p className="m-0 text-lg text-muted">Toda consulta reaproveitada é um atendimento que a prefeitura já pagou e deixa de perder.</p>
          </div>
          {carregando && <Carregando texto="Buscando indicadores…" linhas={3} />}
          {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar os indicadores." erro={erro} onTentar={recarregar} />}
          {!carregando && erro === null && painel && painel.consultas === 0 && painel.vagasDevolvidas === 0 && <Vazio titulo="Ainda não há consultas encerradas no período." />}
          {!carregando && erro === null && painel && (painel.consultas > 0 || painel.vagasDevolvidas > 0) && (
            <>
              <PainelDaRede painel={painel} />
              <p className="mb-0 mt-[18px] text-[13px] text-muted">Números calculados em tempo real pela API. Valor de {moeda(painel.valorPorConsulta)} por consulta, calculado a partir do estudo da Grande Vitória (<a href={SCIELO} target="_blank" rel="noreferrer">Saúde em Debate, 2019</a>).</p>
            </>
          )}
        </div>
      </section>

      <section id="confianca">
        <div className="mx-auto vv-container px-8 py-28">
          <div className="mb-14 max-w-[760px]">
            <span className="vv-eyebrow">SEGURANÇA E CONFIANÇA</span>
            <h2 className={`my-[18px] ${H2}`}>A IA ajuda a equipe. Quem decide é a equipe.</h2>
            <p className="m-0 text-lg text-muted">Feita para o serviço público: simples, segura e útil mesmo quando a tecnologia falha.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] border-t border-line">
            {CONFIANCA.map((c) => (
              <div key={c.t} className="border-b border-line py-8 pr-7">
                <svg className="text-accent-text" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">{c.i}</svg>
                <div className="mb-2 mt-[18px] text-[19px] font-medium">{c.t}</div>
                <p className="m-0 text-[15px] text-muted">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 rounded-[22px] border border-accent-deep px-7 py-6">
            <span className="text-[clamp(25.6px,2.4vw,34.3px)] font-light leading-none tracking-[-0.03em] text-accent-text">110.527</span>
            <span className="flex-[1_1_240px] text-justify text-base">consultas reais do SUS em Vitória (ES) ensinaram a IA a reconhecer o padrão de quem falta.</span>
            <a href="https://www.kaggle.com/joniarroba/noshowappointments" target="_blank" rel="noreferrer" className={LABEL_FONTE}>Base pública ↗</a>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-x-[72px] gap-y-10 px-8 py-28">
          <div className="flex flex-col items-start gap-6">
            <span className="vv-eyebrow">PERGUNTAS FREQUENTES</span>
            <h2 className="m-0 text-[clamp(27.2px,2.9vw,37.4px)] font-light leading-[1.08] tracking-[-0.035em]">O que a sua equipe vai perguntar.</h2>
            <Link to="/faq" className="vv-ghost !min-h-12 !px-[22px] !text-[15px]">Ver todas as perguntas<IconeSeta tamanho={14} /></Link>
          </div>
          <div className="border-t border-line">
            {FAQ.map(([p, r]) => (
              <details key={p} className="border-b border-line">
                <summary className="flex items-center justify-between gap-4 py-6 text-lg font-medium">{p}<IconeMais20 /></summary>
                <p className="mb-6 mt-0 max-w-[620px] text-base text-muted">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="relative overflow-hidden">
        <div className="vv-dots pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[72px] gap-y-12 px-4 py-28 sm:px-8">
          <div>
            <h2 className="mb-5 mt-0 text-[clamp(32px,3.8vw,49.9px)] font-light leading-[1.04] tracking-[-0.04em]">Leve a Vaga Viva para a sua rede de saúde.</h2>
            <p className="mb-7 mt-0 text-lg text-muted">Para secretarias municipais de saúde. Assinatura por unidade, com implantação e suporte. Para o paciente, é gratuito.</p>
            <div className="flex flex-col gap-3 text-[15.5px]">
              {['Demonstração com a agenda da sua unidade', 'Cálculo do retorno para o seu município'].map((t) => (
                <span key={t} className="flex items-center gap-3"><IconeCheck tamanho={18} className="text-accent-text" />{t}</span>
              ))}
            </div>
          </div>
          <FormDemonstracao />
        </div>
      </section>
    </main>
  )
}