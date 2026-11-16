import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconeMais20 } from '../components/Icones'
import { FILTROS_FAQ, NOMES_CATEGORIA, PERGUNTAS, type CategoriaFaq } from '../data/faq'

export default function Faq() {
  const [categoria, setCategoria] = useState<CategoriaFaq | 'todas'>('todas')
  const lista = PERGUNTAS.filter((q) => categoria === 'todas' || q.c === categoria)

  return (
    <main id="conteudo">
      <section className="relative overflow-hidden">
        <div className="vv-dots absolute inset-0 opacity-50" />
        <div className="relative mx-auto vv-container px-8 pb-20 pt-[104px]">
          <span className="vv-eyebrow">PERGUNTAS FREQUENTES</span>
          <h1 className="my-[18px] max-w-[860px] text-[clamp(35.2px,4.3vw,59.3px)] font-light leading-[1.02] tracking-[-0.04em]">Tudo o que você precisa saber antes de começar.</h1>
          <p className="m-0 max-w-[640px] text-[19px] text-muted">Respostas diretas para pacientes, equipes de saúde e gestores.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto flex vv-container flex-wrap gap-12 px-8 pb-24 pt-[72px]">
          <div role="group" aria-label="Categorias" className="flex flex-[1_1_260px] flex-col gap-2 self-start">
            {FILTROS_FAQ.map((f) => {
              const ativo = f.id === categoria
              const total = PERGUNTAS.filter((q) => f.id === 'todas' || q.c === f.id).length
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setCategoria(f.id)}
                  className={`flex min-h-[52px] items-center justify-between rounded-2xl border px-[18px] text-left text-[15.5px] text-text transition-colors ${ativo ? 'border-accent-deep bg-surface' : 'border-line bg-transparent'}`}
                >
                  {f.label}
                  <span className={`text-xs tabular-nums ${ativo ? 'text-accent-text' : 'text-muted'}`}>{String(total).padStart(2, '0')}</span>
                </button>
              )
            })}
          </div>

          <div className="min-w-0 flex-[999_1_560px] border-t border-line">
            {lista.map((q) => (
              <details key={q.p} className="vv-rise border-b border-line">
                <summary className="group flex items-center justify-between gap-4 py-[26px]">
                  <span className="flex flex-col gap-1.5">
                    <span className="text-[11px] tracking-[0.18em] text-muted">{NOMES_CATEGORIA[q.c]}</span>
                    <span className="text-[19px] font-medium transition-colors group-hover:text-accent-text">{q.p}</span>
                  </span>
                  <IconeMais20 tamanho={22} />
                </summary>
                <p className="mb-[26px] mt-0 max-w-[680px] text-[16.5px] text-muted">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto vv-container px-8 py-[88px]">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-accent-deep p-10">
            <div>
              <div className="text-[23.8px] font-light tracking-[-0.02em]">Não encontrou o que procurava?</div>
              <div className="mt-1.5 text-base text-muted">Nossa equipe responde pelo formulário de contato.</div>
            </div>
            <Link to="/contato" className="vv-primary !min-h-[54px] !px-7 !text-base">Falar com a equipe</Link>
          </div>
        </div>
      </section>
    </main>
  )
}