import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '../services/api'
import { definirAoExpirarSessao, definirToken } from '../services/http'
import type { Usuario } from '../types'

const TOKEN_KEY = 'vv-token'

function lerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function apagarToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
  }
}

function guardarToken(token: string, manterConectado: boolean) {
  apagarToken()
  try {
    ;(manterConectado ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  } catch {
  }
}

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  entrar: (email: string, senha: string, manterConectado: boolean) => Promise<Usuario>
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(() => lerToken() !== null)

  const encerrar = useCallback(() => {
    apagarToken()
    definirToken(null)
    setUsuario(null)
  }, [])

  useEffect(() => {
    definirAoExpirarSessao(encerrar)
    const token = lerToken()
    if (token) {
      definirToken(token)
      api
        .buscarMe()
        .then(setUsuario)
        .catch(() => undefined)
        .finally(() => setCarregando(false))
    }
    return () => definirAoExpirarSessao(null)
  }, [encerrar])

  const entrar = useCallback(async (email: string, senha: string, manterConectado: boolean) => {
    const resposta = await api.login(email, senha, manterConectado)
    guardarToken(resposta.token, manterConectado)
    definirToken(resposta.token)
    setUsuario(resposta.usuario)
    return resposta.usuario
  }, [])

  const sair = useCallback(() => {
    api.logout().catch(() => undefined).finally(encerrar)
  }, [encerrar])

  const value = useMemo(() => ({ usuario, carregando, entrar, sair }), [usuario, carregando, entrar, sair])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de um <AuthProvider>')
  return context
}
