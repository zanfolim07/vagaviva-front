import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const RAIO = 24
const CIRCUNFERENCIA = 2 * Math.PI * RAIO
const APARECE_APOS = 400

export function VoltarTopo() {
  const { pathname } = useLocation()
  const [rolagem, setRolagem] = useState({ visivel: false, progresso: 0 })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    function atualizar() {
      const altura = document.documentElement.scrollHeight - window.innerHeight
      setRolagem({ visivel: window.scrollY > APARECE_APOS, progresso: altura > 0 ? window.scrollY / altura : 0 })
    }
    window.addEventListener('scroll', atualizar, { passive: true })
    window.addEventListener('resize', atualizar)
    return () => {
      window.removeEventListener('scroll', atualizar)
      window.removeEventListener('resize', atualizar)
    }
  }, [])

  return (
    <button
      type="button"
      aria-label="Voltar para o topo"
      title="Voltar para o topo"
      tabIndex={rolagem.visivel ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`vv-topo ${rolagem.visivel ? 'vv-topo-visivel' : ''}`}
    >
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={RAIO} fill="none" stroke="var(--line)" strokeWidth="2.5" />
        <circle cx="28" cy="28" r={RAIO} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - rolagem.progresso)} />
      </svg>
      <svg className="vv-topo-seta" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}