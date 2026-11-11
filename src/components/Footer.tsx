import { Link } from 'react-router-dom'

const titulo = 'text-[11px] tracking-[0.2em] text-muted'
const link = '!text-muted no-underline hover:!text-text'

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface text-text">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-8 px-6 pb-8 pt-11 sm:px-10 xl:px-20">
        <div className="flex flex-col gap-2.5">
          <span className="text-[17px] font-bold">Vaga Viva</span>
          <span className="max-w-[260px] text-sm text-muted">Nenhuma consulta vazia enquanto alguém espera.</span>
        </div>
        <nav aria-label="Institucional" className="flex flex-col gap-2.5 text-sm">
          <span className={titulo}>EMPRESA</span>
          <Link className={link} to="/sobre">Sobre</Link>
          <Link className={link} to="/integrantes">Integrantes</Link>
          <Link className={link} to="/faq">Perguntas frequentes</Link>
          <Link className={link} to="/contato">Contato</Link>
        </nav>
        <nav aria-label="Sistema" className="flex flex-col gap-2.5 text-sm">
          <span className={titulo}>SISTEMA</span>
          <Link className={link} to="/login">Entrar na área da equipe</Link>
          <Link className={link} to="/lista-espera">Lista de espera</Link>
          <Link className={link} to="/painel">Painel da gestão</Link>
        </nav>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-line px-6 pb-7 pt-[18px] sm:px-10 xl:px-20">
        <span className="text-[12.5px] text-muted">© 2026 Vaga Viva</span>
        <span className="text-[11px] tracking-[0.4em] text-danger-text">FIAP</span>
      </div>
    </footer>
  )
}