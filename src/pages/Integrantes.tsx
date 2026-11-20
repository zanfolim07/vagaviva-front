import { Link } from 'react-router-dom'
import { INTEGRANTES, TURMA } from '../data/integrantes'

function LinkPerfil({ url, rotulo, children }: { url: string; rotulo: string; children: React.ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label={rotulo} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line !text-text transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:!text-on-accent focus-visible:border-accent focus-visible:bg-accent focus-visible:!text-on-accent motion-reduce:transform-none">
      {children}
    </a>
  )
}

export default function Integrantes() {
  return (
    <main id="conteudo">
      <section className="relative overflow-hidden">
        <div className="vv-dots absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-end gap-x-[72px] gap-y-8 px-8 pb-[88px] pt-[104px]">
          <div className="vv-rise">
            <span className="vv-eyebrow">INTEGRANTES</span>
            <h1 className="mb-0 mt-[18px] text-[clamp(35.2px,4.3vw,59.3px)] font-light leading-[1.02] tracking-[-0.04em]">As pessoas por trás da Vaga Viva.</h1>
          </div>
          <p className="m-0 text-[19px] text-muted [hyphens:none]">Cinco frentes trabalhando no mesmo produto: inteligência artificial, dados, sistema, interface e negócio.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-5 px-8 py-[88px]">
          {INTEGRANTES.map((m) => (
            <article key={m.rm} className="group vv-lift flex flex-col gap-[18px] rounded-[26px] border border-line bg-bg p-[26px]">
              <div className="h-[104px] w-[104px] rounded-full border border-line p-1.5 transition-colors group-hover:border-accent-text">
                <img src={m.foto} alt={`Foto de ${m.nome}`} width={92} height={92} loading="lazy" className="h-full w-full rounded-full object-cover" />
              </div>
              <div>
                <div className="text-xl font-medium">{m.nome}</div>
                <div className="mt-2.5 text-xs tabular-nums text-muted">RM {m.rm} · Turma {TURMA}</div>
              </div>
              <div className="mt-auto flex gap-2">
                <LinkPerfil url={m.github} rotulo={`GitHub de ${m.nome}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.3c3-.3 6.1-1.5 6.1-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C5.8 1.1 4.7 1.4 4.7 1.4a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.9 2.3V21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </LinkPerfil>
                <LinkPerfil url={m.linkedin} rotulo={`LinkedIn de ${m.nome}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 10.5V16M8 7.5v.2M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </LinkPerfil>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[72px] gap-y-8 px-8 py-[88px]">
          <h2 className="m-0 text-[clamp(25.6px,2.9vw,37.4px)] font-light leading-[1.08] tracking-[-0.035em]">Quer conversar com a gente sobre a sua rede de saúde?</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contato" className="vv-primary !min-h-[54px] !px-7 !text-base">Fale com a equipe</Link>
            <Link to="/sobre" className="vv-ghost !min-h-[54px] !px-6 !text-base">Nossa história</Link>
          </div>
        </div>
      </section>
    </main>
  )
}