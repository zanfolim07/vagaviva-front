import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppRoutes } from './routes/AppRoutes'

function ErroGeral({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-text">
      <div className="text-[17px] font-medium">Algo deu errado nesta tela.</div>
      <button type="button" onClick={resetErrorBoundary} className="vv-ghost">
        Tentar de novo
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary FallbackComponent={ErroGeral}>
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
