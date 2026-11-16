import fabio from '../assets/integrantes/fabio.png'
import guilherme from '../assets/integrantes/guilherme.png'
import jaime from '../assets/integrantes/jaime.png'
import lucas from '../assets/integrantes/lucas.png'
import mateus from '../assets/integrantes/mateus.png'

export interface Integrante {
  nome: string
  rm: string
  foto: string
  github: string
  linkedin: string
}

export const TURMA = '1TDSPV'

export const INTEGRANTES: Integrante[] = [
  { nome: 'Fabio Cezare Almeida', rm: '572642', foto: fabio, github: 'https://github.com/FabioCAlmeida', linkedin: 'https://www.linkedin.com/in/fabio-cezare-almeida-4b448a408' },
  { nome: 'Guilherme Zanfolim Nunes Farias', rm: '570983', foto: guilherme, github: 'https://github.com/zanfolim07', linkedin: 'https://www.linkedin.com/in/guilherme-zanfolim-202865315' },
  { nome: 'Jaime Ringel', rm: '562044', foto: jaime, github: 'https://github.com/jaimeringel004', linkedin: 'https://www.linkedin.com/in/jaime-ringel-1060bb402' },
  { nome: 'Lucas Monteiro Dias da Costa', rm: '571388', foto: lucas, github: 'https://github.com/monteiroo5', linkedin: 'https://www.linkedin.com/in/lucas-monteiro-1110703b5/' },
  { nome: 'Mateus Magalhães Romão de Moraes', rm: '573371', foto: mateus, github: 'https://github.com/MagalhaesMatheus007', linkedin: 'https://www.linkedin.com/in/matheus-magalh%C3%A3es-ti' },
]