import { BrowserRouter } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { VoltarTopo } from './components/VoltarTopo'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col overflow-x-clip bg-bg leading-[1.55] text-text">
          <Header />
          <main id="conteudo" className="flex flex-1 items-center justify-center px-6 py-24">
            <h1 className="text-3xl font-bold">Vaga Viva</h1>
          </main>
          <Footer />
          <VoltarTopo />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}