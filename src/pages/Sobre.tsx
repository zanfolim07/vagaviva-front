import { Link } from 'react-router-dom'

const FONTE = 'text-[11.5px] tabular-nums !text-muted'
const H2 = 'text-[clamp(27.2px,3.2vw,40.6px)] font-light leading-[1.08] tracking-[-0.035em]'
const SCIELO = 'https://scielosp.org/pdf/sdeb/2019.v43n123/1015-1030/pt'

const NUMEROS = [
  { n: '23%', t: 'média mundial de faltas em consultas agendadas, e 27,8% na América do Sul.', f: 'Saúde em Debate, 2019 ↗', u: SCIELO },
  { n: '25%', t: 'de faltas na rede municipal de São Paulo, onde metade não confirma presença.', f: 'Poder360, 2025 ↗', u: 'https://www.poder360.com.br/poder-saude/sao-paulo-adota-whatsapp-para-confirmacao-de-consultas-medicas/', perigo: true },
  { n: 'US$ 37', t: 'custo médio de cada consulta em Vitória (ES), segundo a própria prefeitura.', f: 'Salazar et al., 2022 ↗', u: 'https://doi.org/10.3390/fi14010003' },
]

const REGRAS = [
  ['Proteção de dados (LGPD)', 'Os dados são tratados para a execução de políticas públicas de saúde, como prevê a LGPD. O sistema usa apenas o necessário para prever faltas e fazer o contato. O acesso fica restrito à equipe da unidade. Ao fim do período de guarda definido pela Secretaria, os dados são apagados ou anonimizados.'],
  ['Sem discriminação', 'O modelo não usa sexo, renda, programa social nem doenças. Testamos as duas versões e o acerto foi praticamente o mesmo, então ficamos com a que usa menos dados. O desempenho é acompanhado por faixa de idade para que nenhum grupo fique sem atenção.'],
  ['A decisão é sempre humana', 'A IA nunca cancela uma consulta. O risco só define a ordem e a insistência do contato. Quem libera a vaga é o próprio paciente, ao responder, ou a recepção, quando não há resposta.'],
  ['Ninguém fica de fora', 'Nem todo paciente usa WhatsApp. O contato segue uma ordem: WhatsApp, SMS e, sem resposta, ligação da recepção. No cadastro, o paciente pode indicar o canal preferido e o telefone de um familiar.'],
  ['O que ainda precisa ser provado', 'A base usada no treino é de Vitória (ES), de 2016. Antes de expandir, propomos um piloto de três meses em uma UBS: medir a taxa de faltas antes e depois, ajustar o modelo com os dados locais e só então levar a outras unidades.'],
  ['De onde vêm as consultas', 'Na operação real, a agenda viria do sistema que a unidade já usa, sem trabalho em dobro para a recepção. Nesta versão de demonstração, as consultas são cadastradas diretamente na Vaga Viva.'],
]

const PONTAS = [
  ['Paciente', 'Responde pelo celular e, se estiver na fila, é chamado mais cedo. Não paga nada.'],
  ['Unidade de saúde', 'A recepção sabe para quem ligar e não perde tempo remanejando horários na mão.'],
  ['Secretaria de Saúde', 'Contrata por unidade e acompanha o resultado em reais, com dados para decidir.'],
]

const ODS = [
  ['3', 'Saúde e bem-estar', 'Mais consultas realizadas com a mesma estrutura.'],
  ['9', 'Indústria, inovação e infraestrutura', 'IA aplicada a um serviço público essencial.'],
  ['10', 'Redução das desigualdades', 'Acesso mais rápido para quem depende só do SUS.'],
]

export default function Sobre() {
  return (
    <main id="conteudo">
      <section className="relative overflow-hidden">
        <div className="vv-dots absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-end gap-x-[72px] gap-y-10 px-8 pb-24 pt-[104px]">
          <div>
            <span className="vv-rise vv-eyebrow">SOBRE NÓS</span>
            <h1 className="vv-rise vv-d1 mb-0 mt-[18px] text-[clamp(35.2px,4.3vw,59.3px)] font-light leading-[1.02] tracking-[-0.04em]">Cada consulta é a vez de alguém.</h1>
          </div>
          <p className="vv-rise vv-d2 m-0 text-[19px] text-muted">A Vaga Viva nasceu de uma pergunta simples: por que tanta gente espera meses por uma consulta se, todo dia, horários ficam vazios nas unidades de saúde? Nossa resposta une previsão, contato certo e uma fila que anda sozinha.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-y-8 border-l border-line px-8 py-24">
          {[['MISSÃO', 'Fazer cada horário da agenda pública virar atendimento.'], ['PARA QUEM', 'Pacientes do SUS, equipes de UBS e secretarias municipais de saúde.'], ['COMO', 'Inteligência artificial que antecipa a falta e devolve a vaga à fila.']].map(([t, d]) => (
            <div key={t} className="border-r border-line px-8 py-2">
              <div className="text-xs tracking-[0.2em] text-accent-text">{t}</div>
              <p className="mb-0 mt-4 text-[21px] font-light leading-[1.45]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto vv-container px-8 py-[104px]">
          <div className="mb-14 max-w-[760px]">
            <span className="vv-eyebrow">O PROBLEMA QUE ESCOLHEMOS</span>
            <h2 className={`my-[18px] ${H2}`}>Uma vaga vazia custa duas vezes.</h2>
            <p className="m-0 text-lg text-muted">Custa para quem faltou, que fica sem o cuidado. E custa para quem esperava, que continua na fila. Enquanto isso, a unidade paga por um horário que não virou atendimento.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-9">
            {NUMEROS.map((x) => (
              <div key={x.n} className="border-t border-text pt-5">
                <div className={`text-[45.9px] font-light leading-none tracking-[-0.04em] ${x.perigo ? 'text-danger-text' : ''}`}>{x.n}</div>
                <p className="mb-2 mt-3 text-[15.5px]">{x.t}</p>
                <a href={x.u} target="_blank" rel="noreferrer" className={FONTE}>{x.f}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto vv-container px-8 py-[104px]">
          <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-5">
            <div>
              <span className="vv-eyebrow">A TECNOLOGIA</span>
              <h2 className={`mb-0 mt-[18px] ${H2}`}>Dois modelos de IA, um objetivo.</h2>
            </div>
            <p className="m-0 text-lg text-muted">Treinados com 110.527 consultas reais do SUS em Vitória (ES), a partir de uma <a href="https://www.kaggle.com/joniarroba/noshowappointments" target="_blank" rel="noreferrer">base pública</a>.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-5">
            <div className="vv-lift flex flex-col gap-[18px] rounded-[26px] border border-line p-6 sm:p-9">
              <span className="text-xs tracking-[0.18em] text-muted">MODELO 01</span>
              <div className="text-[23.8px] tracking-[-0.02em]">Risco de falta</div>
              <p className="m-0 text-base text-muted">Estima, para cada consulta, a chance de o paciente não comparecer. Considera fatores como antecedência do agendamento, histórico de faltas e se houve lembrete, e explica quais pesaram mais.</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {['Antecedência', 'Histórico de faltas', 'Lembrete recebido', 'Dia da semana'].map((t) => (
                  <span key={t} className="rounded-full border border-line px-3 py-[5px] text-[13px]">{t}</span>
                ))}
              </div>
            </div>
            <div className="vv-lift flex flex-col gap-[18px] rounded-[26px] border border-line p-6 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.18em] text-muted">MODELO 02</span>
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-accent" />
                  <span className="h-3 w-3 rounded-full bg-mid" />
                  <span className="h-3 w-3 rounded-full bg-danger" />
                </span>
              </div>
              <div className="text-[23.8px] tracking-[-0.02em]">Perfis de pacientes</div>
              <p className="m-0 text-base text-muted">Agrupa pacientes com comportamento parecido, como quem costuma agendar com muita antecedência. Assim a gestão entende por que as pessoas faltam e ajusta a forma de agendar.</p>
              <p className="mb-0 mt-1 text-sm">A IA nunca cancela uma consulta. Ela só indica com quem a equipe deve falar primeiro.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="transp-t">
        <div className="mx-auto vv-container px-8 py-[104px]">
          <span className="vv-eyebrow">TRANSPARÊNCIA</span>
          <h2 id="transp-t" className={`my-[18px] max-w-[820px] ${H2}`}>Dados de saúde pedem cuidado. Estas são as nossas regras.</h2>
          <p className="mb-12 mt-0 max-w-[820px] text-lg text-muted">A Vaga Viva trabalha com informações pessoais de pacientes do SUS. Por isso, decidimos desde o início o que o sistema pode e o que não pode fazer.</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-5">
            {REGRAS.map(([t, d]) => (
              <div key={t} className="vv-lift rounded-[22px] border border-line p-7">
                <div className="mb-2.5 text-xl font-medium">{t}</div>
                <p className="m-0 text-[15.5px] text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper text-paper-text">
        <div className="mx-auto vv-container px-8 py-[104px]">
          <span className="text-xs font-medium tracking-[0.24em] text-paper-label">QUEM PARTICIPA</span>
          <h2 className={`mb-12 mt-[18px] max-w-[760px] ${H2}`}>Uma solução, três pontas que ganham juntas.</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-8">
            {PONTAS.map(([t, d]) => (
              <div key={t} className="border-t-2 border-paper-text pt-5">
                <div className="text-[22px] font-medium">{t}</div>
                <p className="mb-0 mt-2.5 text-base text-paper-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-[72px] gap-y-10 px-8 py-[104px]">
          <div>
            <span className="vv-eyebrow">NOSSO COMPROMISSO</span>
            <h2 className={`my-[18px] ${H2}`}>Impacto que dá para medir.</h2>
            <p className="m-0 text-lg text-muted">Acompanhamos a taxa de faltas, as vagas reaproveitadas, o valor preservado e o tempo de espera na fila. A Vaga Viva contribui para três Objetivos de Desenvolvimento Sustentável da ONU.</p>
          </div>
          <div className="flex flex-col border-t border-line">
            {ODS.map(([n, t, d]) => (
              <div key={n} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-b border-line py-[22px]">
                <span className="text-[34px] font-light leading-none text-accent-text">{n}</span>
                <div>
                  <div className="text-lg font-medium">{t}</div>
                  <div className="text-[15px] text-muted">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex vv-container flex-wrap items-center justify-between gap-8 px-8 py-24">
          <h2 className="m-0 max-w-[640px] text-[clamp(25.6px,2.9vw,37.4px)] font-light leading-[1.08] tracking-[-0.035em]">Quer ver a Vaga Viva com a agenda da sua unidade?</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contato" className="vv-primary !min-h-[54px] !px-7 !text-base">Agendar demonstração</Link>
            <Link to="/integrantes" className="vv-ghost !min-h-[54px] !px-6 !text-base">Conheça os integrantes</Link>
          </div>
        </div>
      </section>
    </main>
  )
}