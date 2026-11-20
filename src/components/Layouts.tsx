import { Suspense, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { Spinner } from './Estados'
import { Footer } from './Footer'
import { Header } from './Header'
import { VoltarTopo } from './VoltarTopo'

function CarregandoPagina() {
  return (
    <div aria-live="polite" className="flex min-h-[50vh] items-center justify-center gap-2.5 text-sm text-muted">
      <Spinner />
      Carregando…
    </div>
  )
}

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-bg leading-[1.55] text-text">
      <Header />
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<CarregandoPagina />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <VoltarTopo />
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-text">
      <AppHeader />
      <main id="conteudo" className="mx-auto vv-container-app px-4 pb-24 pt-10 sm:px-7 sm:pt-14">
        <Suspense fallback={<CarregandoPagina />}>
          <Outlet />
        </Suspense>
      </main>
      <VoltarTopo />
    </div>
  )
}

export function PacienteLayout() {
  return (
    <div className="vv-dots flex min-h-screen justify-center bg-bg text-text">
      <div className="flex min-h-screen w-full max-w-[430px] flex-col px-[22px] pb-[26px] pt-7">
        <Suspense fallback={<CarregandoPagina />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}

export function TopoPaciente({ unidade }: { unidade?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-bold">Vaga Viva</span>
      {unidade && <span className="text-[12.5px] text-muted">{unidade}</span>}
    </div>
  )
}

export function CartaoSituacao({ children, circulo }: { children: ReactNode; circulo: ReactNode }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-[18px] text-center">
      {circulo}
      {children}
    </div>
  )
}