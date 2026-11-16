import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '../components/Estados'
import { useAuth } from '../context/AuthContext'
import type { Perfil } from '../types'

export function ProtectedRoute({ children, perfil }: { children: ReactNode; perfil?: Perfil }) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div aria-live="polite" className="flex min-h-screen items-center justify-center gap-2.5 bg-bg text-sm text-muted">
        <Spinner />
        Verificando sessão…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />
  if (perfil && usuario.perfil !== perfil) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2.5 rounded-[20px] border border-danger px-6 py-10 text-center">
        <div className="text-[17px] font-medium">Sem permissão</div>
        <div className="text-sm text-muted">Esta tela é exclusiva do perfil Gestão.</div>
      </div>
    )
  }
  return <>{children}</>
}