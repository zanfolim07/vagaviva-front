import type { ErroApi } from '../types'

const API = import.meta.env.VITE_API_URL

export class HttpError extends Error {
  status: number
  corpo: ErroApi | null

  constructor(status: number, mensagem: string, corpo: ErroApi | null = null) {
    super(mensagem)
    this.name = 'HttpError'
    this.status = status
    this.corpo = corpo
  }
}

let tokenAtual: string | null = null
let aoExpirarSessao: (() => void) | null = null

export function definirToken(token: string | null) {
  tokenAtual = token
}

export function definirAoExpirarSessao(acao: (() => void) | null) {
  aoExpirarSessao = acao
}

export async function http<T>(caminho: string, options: RequestInit = {}): Promise<T> {
  const tokenEnviado = tokenAtual
  const { headers, ...rest } = options

  let response: Response
  try {
    response = await fetch(`${API}${caminho}`, {
      ...rest,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(tokenEnviado ? { Authorization: `Bearer ${tokenEnviado}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new HttpError(0, 'O servidor não respondeu. Verifique a conexão e tente de novo.')
  }

  if (!response.ok) {
    const corpo = (await response.json().catch(() => null)) as ErroApi | null
    if (response.status === 401 && tokenEnviado) {
      aoExpirarSessao?.()
    }
    throw new HttpError(response.status, corpo?.mensagem ?? `Falha na requisição: ${response.status}`, corpo)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpError) {
    if (erro.status === 403) return erro.corpo?.mensagem ?? 'Você não tem permissão para fazer isso.'
    if (erro.status >= 500) return 'O servidor não respondeu. Tente de novo em instantes.'
    return erro.message
  }
  return 'Algo deu errado. Tente de novo em instantes.'
}
