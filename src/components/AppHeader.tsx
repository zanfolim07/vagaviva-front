import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { iniciais } from '../utils/formatos'
import { BotaoTema } from './BotaoTema'
import { SaltoConteudo } from './Header'
import { IconeFechar, IconeMenu } from './Icones'

const classeAba = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-surface !text-text' : 'bg-transparent !text-muted')

export function AppHeader() {
  const { usuario, sair } = useAuth()
  const [aberto, setAberto] = useState(false)
  if (!usuario) return null

  const abas = [
    { rota: '/agenda', label: 'Agenda' },
    { rota: '/consultas/nova', label: 'Nova consulta' },
    { rota: '/pacientes', label: 'Pacientes' },
    { rota: '/lista-espera', label: 'Lista de espera' },
    { rota: '/painel', label: 'Painel' },
    ...(usuario.perfil === 'GESTAO' ? [{ rota: '/admin/equipe', label: 'Equipe' }] : []),
  ]
  const perfil = usuario.perfil === 'GESTAO' ? 'Gestão' : 'Recepção'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg text-text">
      <SaltoConteudo />
      <div className="mx-auto flex vv-container-app flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pb-3.5 pt-6">
        <div className="flex items-center gap-3.5">
          <Link to="/agenda" aria-label="Vaga Viva, agenda" className="flex min-h-11 items-center !text-text no-underline">
            <span className="text-[19px] font-bold tracking-[-0.02em]">Vaga Viva</span>
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-[5px] text-[13px] sm:inline-flex">
            <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-accent" />
            {usuario.unidade.nome}
          </span>
        </div>

        <nav aria-label="Sistema" className="hidden gap-1 text-[14.5px] min-[1180px]:flex">
          {abas.map((a) => (
            <NavLink key={a.rota} to={a.rota} className={(e) => `inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3.5 no-underline transition-colors ${classeAba(e)}`}>
              {a.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <BotaoTema />
          <Link to="/" className="vv-ghost hidden lg:inline-flex">
            Ver site
          </Link>
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f7a4a] text-[13px] font-semibold text-[#f5f5f4]">
              {iniciais(usuario.nome)}
            </span>
            <span className="hidden leading-tight xl:block">
              <span className="block text-[13.5px]">{usuario.nome}</span>
              <span className="block text-xs text-muted">{perfil}</span>
            </span>
          </span>
          <button type="button" onClick={sair} className="vv-ghost hidden min-[1180px]:inline-flex">
            Sair
          </button>
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            aria-controls="menu-sistema"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-text min-[1180px]:hidden"
          >
            {aberto ? <IconeFechar /> : <IconeMenu />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav id="menu-sistema" aria-label="Menu do sistema" className="vv-drop flex max-h-[calc(100vh-90px)] flex-col gap-1 overflow-y-auto border-t border-line px-6 pb-6 pt-3 min-[1180px]:hidden">
          {abas.map((a) => (
            <NavLink key={a.rota} to={a.rota} onClick={() => setAberto(false)} className={(e) => `flex min-h-[52px] items-center rounded-[14px] px-4 text-[17px] no-underline ${classeAba(e)}`}>
              {a.label}
            </NavLink>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Link to="/" onClick={() => setAberto(false)} className="vv-ghost !min-h-[52px]">
              Ver site
            </Link>
            <button type="button" onClick={sair} className="vv-ghost !min-h-[52px]">
              Sair
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}