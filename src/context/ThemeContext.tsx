import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'

type Tema = 'dark' | 'light'

const CHAVE = 'vv-tema'

function temaInicial(): Tema {
  try {
    return localStorage.getItem(CHAVE) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

interface ThemeContextValue {
  tema: Tema
  alternarTema: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial)

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const novo = atual === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', novo)
      try {
        localStorage.setItem(CHAVE, novo)
      } catch {
      }
      return novo
    })
  }, [])

  const value = useMemo(() => ({ tema, alternarTema }), [tema, alternarTema])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTema(): ThemeContextValue {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTema precisa estar dentro de um <ThemeProvider>')
  return context
}