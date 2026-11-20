import { useTema } from '../context/ThemeContext'
import { IconeLua, IconeSol } from './Icones'

export function BotaoTema() {
  const { tema, alternarTema } = useTema()
  const escuro = tema === 'dark'
  const rotulo = escuro ? 'Ativar modo claro' : 'Ativar modo escuro'
  return (
    <button type="button" onClick={alternarTema} aria-label={rotulo} title={rotulo} className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line bg-transparent text-text">
      {escuro ? <IconeSol /> : <IconeLua />}
    </button>
  )
}