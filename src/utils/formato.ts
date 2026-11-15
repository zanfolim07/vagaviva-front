import type { CanalContato, NivelRisco, Risco } from '../types'

const FUSO = 'America/Sao_Paulo'

function partes(data: Date) {
  const lista = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data)
  const valor = (tipo: string) => lista.find((p) => p.type === tipo)?.value ?? ''
  return { ano: valor('year'), mes: valor('month'), dia: valor('day'), hora: valor('hour'), minuto: valor('minute'), segundo: valor('second') }
}

export function hojeIso(agora = new Date()) {
  const p = partes(agora)
  return `${p.ano}-${p.mes}-${p.dia}`
}

export function agoraIso(agora = new Date()) {
  const p = partes(agora)
  return `${p.ano}-${p.mes}-${p.dia}T${p.hora}:${p.minuto}:${p.segundo}`
}

export function relogioTexto(agora: Date) {
  const p = partes(agora)
  return `${p.hora}:${p.minuto}:${p.segundo}`
}

export const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
export const dataCompleta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
export const hora = (iso: string) => iso.slice(11, 16)

export function horaFalada(iso: string) {
  const [h, m] = hora(iso).split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

function diaDaSemana(iso: string, opcao: 'long' | 'short') {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { weekday: opcao, timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, d)))
}

export const semanaLonga = (iso: string) => diaDaSemana(iso, 'long')

export function diaPorExtenso(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  const data = new Date(Date.UTC(a, m - 1, d))
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(data)
}

export function diaCurto(iso: string) {
  return `${semanaLonga(iso).replace('-feira', '')}, ${dataCurta(iso)}`
}

export function somarDias(iso: string, dias: number) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
}

export function moeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function percentual(fracao: number, casas = 1) {
  return `${(fracao * 100).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
}

export const CANAIS: Record<CanalContato, string> = { WHATSAPP: 'WhatsApp', SMS: 'SMS', LIGACAO: 'Ligação' }

export function telefone(numero: string | null) {
  if (!numero) return 'Não informado'
  return `(${numero.slice(0, 2)}) ${numero.slice(2, numero.length - 4)}-${numero.slice(-4)}`
}

export const cartaoSus = (c: string) => `${c.slice(0, 3)} ${c.slice(3, 7)} ${c.slice(7, 11)} ${c.slice(11)}`

export function idade(nascimento: string, hoje = hojeIso()) {
  const anos = Number(hoje.slice(0, 4)) - Number(nascimento.slice(0, 4))
  return hoje.slice(5) < nascimento.slice(5) ? anos - 1 : anos
}

export function iniciais(nome: string) {
  const partesNome = nome.trim().split(/\s+/)
  const ultima = partesNome.length > 1 ? partesNome[partesNome.length - 1][0] : ''
  return (partesNome[0][0] + ultima).toUpperCase()
}

export const riscoPercentual = (r: Risco) => (r.valor === null ? null : Math.round(r.valor * 100))

export function resumoRisco(risco: Risco) {
  if (risco.nivel === 'NAO_CALCULADO') return 'Serviço de IA indisponível no agendamento, risco não calculado'
  if (risco.motivos.length > 0) return risco.motivos.join(' · ')
  return 'Nenhum fator isolado se destacou: o percentual combina idade, antecedência, dia da semana, lembrete e histórico de faltas'
}

export const NOME_NIVEL: Record<NivelRisco, string> = {
  ALTO: 'ALTO',
  MEDIO: 'MÉDIO',
  BAIXO: 'BAIXO',
  NAO_CALCULADO: 'NÃO CALCULADO',
}

export const normalizar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const TELEFONE_VALIDO = /^\d{10,11}$/
export const CARTAO_VALIDO = /^\d{15}$/
