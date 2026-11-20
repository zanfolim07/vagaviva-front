import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BotaoTema } from './BotaoTema'
import { IconeFechar, IconeMenu } from './Icones'

const LINKS = [
  { rota: '/', label: 'Início' },
  { rota: '/sobre', label: 'Sobre' },
  { rota: '/integrantes', label: 'Integrantes' },
  { rota: '/faq', label: 'Perguntas' },
  { rota: '/contato', label: 'Contato' },
]

const classeLink = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-surface !text-text' : 'bg-transparent !text-muted')

export function SaltoConteudo() {
  return (
    <a href="#conteudo" className="absolute -top-20 left-4 z-50 rounded-xl bg-accent px-[18px] py-3 font-semibold !text-[#0b0b0b] no-underline transition-[top] focus:top-3">
      Pular para o conteúdo
    </a>
  )
}

export function Header() {
  const [aberto, setAberto] = useState(false)
  const fechar = () => setAberto(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg text-text">
      <SaltoConteudo />
      <div className="mx-auto flex vv-container items-center justify-between gap-4 px-6 pb-3.5 pt-6">
        <Link to="/" aria-label="Vaga Viva, página inicial" className="flex min-h-11 items-center !text-text no-underline">
          <span className="text-[19px] font-bold tracking-[-0.02em]">Vaga Viva</span>
        </Link>

        <nav aria-label="Principal" className="hidden gap-1 text-[14.5px] min-[921px]:flex">
          {LINKS.map((l) => (
            <NavLink key={l.rota} to={l.rota} end={l.rota === '/'} className={(e) => `inline-flex min-h-11 items-center rounded-full px-3.5 no-underline transition-colors ${classeLink(e)}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <BotaoTema />
          <Link to="/login" className="vv-ghost hidden min-[921px]:inline-flex">
            Entrar no sistema
          </Link>
          <Link to="/contato" className="vv-primary hidden !min-h-11 !px-[18px] !text-sm min-[921px]:inline-flex">
            Agendar demonstração
          </Link>
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            aria-controls="menu-site"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-text min-[921px]:hidden"
          >
            {aberto ? <IconeFechar /> : <IconeMenu />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav id="menu-site" aria-label="Menu" className="vv-drop flex max-h-[calc(100vh-90px)] flex-col gap-1 overflow-y-auto border-t border-line px-6 pb-6 pt-3 min-[921px]:hidden">
          {LINKS.map((l) => (
            <NavLink key={l.rota} to={l.rota} end={l.rota === '/'} onClick={fechar} className={(e) => `flex min-h-[52px] items-center rounded-[14px] px-4 text-[17px] no-underline ${classeLink(e)}`}>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
            <Link to="/login" onClick={fechar} className="vv-ghost !min-h-[52px]">
              Entrar no sistema
            </Link>
            <Link to="/contato" onClick={fechar} className="vv-primary !text-[15px]">
              Agendar demonstração
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}