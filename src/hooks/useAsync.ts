import { useCallback, useEffect, useRef, useState } from 'react'

export const INTERVALO_ATUALIZACAO = 30_000

export function useAsync<T>(carregar: () => Promise<T>, dependencias: unknown[], intervaloMs?: number) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<unknown>(null)
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  const funcao = useRef(carregar)
  const silencioso = useRef(false)
  useEffect(() => {
    funcao.current = carregar
  })

  const chave = JSON.stringify(dependencias)

  useEffect(() => {
    let ativo = true
    if (silencioso.current) {
      silencioso.current = false
    } else {
      setCarregando(true)
    }

    funcao
      .current()
      .then((resultado) => {
        if (!ativo) return
        setDados(resultado)
        setErro(null)
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    const intervalo = intervaloMs
      ? setInterval(() => {
          funcao
            .current()
            .then((resultado) => {
              if (ativo) setDados(resultado)
            })
            .catch(() => undefined)
        }, intervaloMs)
      : undefined

    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [chave, versao, intervaloMs])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  const atualizar = useCallback(() => {
    silencioso.current = true
    setVersao((v) => v + 1)
  }, [])

  return { dados, erro, carregando, recarregar, atualizar }
}
