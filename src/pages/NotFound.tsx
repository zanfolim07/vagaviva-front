import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main id="conteudo" className="relative flex flex-1 items-center overflow-hidden">
      <div aria-hidden="true" className="vv-brilho pointer-events-none absolute left-1/2 top-1/2 -ml-[310px] -mt-[310px] h-[620px] w-[620px] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgba(158,247,200,.22),rgba(158,247,200,0)_75%)] blur-2xl" />
      <div className="relative mx-auto flex max-w-[760px] flex-col items-start gap-5 px-6 py-24">
        <span className="text-xs font-medium tracking-[0.24em] text-accent-text">ERRO 404</span>
        <h1 className="m-0 text-[clamp(32px,4.2vw,52px)] font-light leading-[1.08] tracking-[-0.035em]">
          Esta página <span className="font-semibold text-accent-text">não existe.</span>
        </h1>
        <p className="m-0 max-w-[560px] text-[17px] text-muted">O endereço pode ter sido digitado errado ou a página mudou de lugar. Se você veio por um link de consulta, peça um novo link à sua unidade de saúde.</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link to="/" className="vv-primary">Voltar ao início</Link>
          <Link to="/contato" className="vv-ghost !min-h-[52px] !px-[22px]">Falar com a equipe</Link>
        </div>
      </div>
    </main>
  )
}