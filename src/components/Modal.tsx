import { useEffect, useRef, type ReactNode } from 'react'
import { IconeFechar } from './Icones'

interface ModalProps {
  titulo: string
  descricao?: string
  aoFechar: () => void
  children: ReactNode
}

export function Modal({ titulo, descricao, aoFechar, children }: ModalProps) {
  const painel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    painel.current?.focus()
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', tecla)
    }
  }, [aoFechar])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:py-10" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={painel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titulo} className="vv-modal my-auto w-full max-w-[680px] rounded-[26px] border border-line bg-bg p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)] outline-none sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-medium">{titulo}</div>
            {descricao && <p className="mb-0 mt-1 text-[13px] text-muted">{descricao}</p>}
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line text-text">
            <IconeFechar tamanho={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
