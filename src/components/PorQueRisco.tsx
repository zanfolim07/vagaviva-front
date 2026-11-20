import { useCallback, useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { explicarRisco } from '../services/api'
import type { Consulta, ExplicacaoRisco, FatorRisco, NivelRisco, Risco } from '../types'
import { diaCurto, hora, NOME_NIVEL, resumoRisco, riscoPercentual } from '../utils/formatos'
import { Modal } from './Modal'
import { SeloRisco } from './Selos'

const SIGNIFICADO: Record<NivelRisco, string> = {
  ALTO: 'Risco alto: a estimativa de falta ficou acima de 35%.',
  MEDIO: 'Risco médio: a estimativa de falta ficou entre 20% e 35%.',
  BAIXO: 'Risco baixo: a estimativa de falta ficou abaixo de 20%.',
  NAO_CALCULADO: 'A consulta foi salva normalmente, mas sem estimativa de falta.',
}

const SEM_EXPLICACAO: ExplicacaoRisco = { calculada: false, fatores: [] }

function textoEfeito(efeito: number) {
  const valor = Math.abs(efeito).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${efeito > 0 ? '+' : '−'}${valor} pts`
}

function Fator({ f }: { f: FatorRisco }) {
  const neutro = f.efeito === null || Math.abs(f.efeito) < 0.05
  const sobe = f.efeito !== null && f.efeito > 0
  const legenda = f.efeito === null ? `${f.fator}: a IA não respondeu nesta comparação` : neutro ? `${f.fator}: não muda ${f.comparacao}` : `${f.fator}: ${sobe ? 'aumenta' : 'reduz'} ${f.comparacao}`
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-surface px-3.5 py-3">
      <div className="min-w-0">
        <div className="text-[14.5px]">{f.valor}</div>
        <div className="mt-0.5 text-[12.5px] text-muted">{legenda}</div>
      </div>
      <span className={`whitespace-nowrap text-[14px] font-semibold tabular-nums ${neutro ? 'text-muted' : sobe ? 'text-danger-text' : 'text-accent-text'}`}>{neutro ? '0 pts' : textoEfeito(f.efeito as number)}</span>
    </div>
  )
}

export function MotivosRisco({ consultaId, risco }: { consultaId: number; risco: Risco }) {
  const { dados, carregando } = useAsync(() => (risco.nivel === 'NAO_CALCULADO' ? Promise.resolve(SEM_EXPLICACAO) : explicarRisco(consultaId)), [consultaId, risco.nivel])
  const fatores = dados?.calculada ? dados.fatores : null

  return (
    <>
      <div className="text-[15px] font-medium">Por que esse risco</div>
      <p className="mb-0 mt-1 text-[14px] text-muted">{SIGNIFICADO[risco.nivel]}</p>
      {carregando ? (
        <div role="status" className="mt-3 rounded-xl bg-surface px-3.5 py-3 text-[14.5px] text-muted">Calculando o peso de cada dado…</div>
      ) : fatores ? (
        <>
          <div className="mt-3 flex flex-col gap-2.5">{fatores.map((f) => <Fator key={f.fator} f={f} />)}</div>
          <p className="mb-0 mt-2.5 text-[12.5px] text-muted [hyphens:none]">Cada número mostra quantos pontos a porcentagem muda ao trocar só aquele dado pela comparação. Os valores não somam o total e não são a causa certa de uma falta.</p>
        </>
      ) : (
        <div className="mt-3 rounded-xl bg-surface px-3.5 py-3 text-[14.5px] first-letter:uppercase">{resumoRisco(risco)}</div>
      )}
    </>
  )
}

export function BotaoRisco({ consulta: c }: { consulta: Consulta }) {
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), [])
  const pct = riscoPercentual(c.risco)

  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-label={`Por que o risco de ${c.paciente.nome} é ${NOME_NIVEL[c.risco.nivel].toLowerCase()}?`} onClick={() => setAberto(true)} className="group flex flex-col items-center gap-1 rounded-2xl">
        <SeloRisco risco={c.risco} />
        <span className="text-[12px] text-muted underline underline-offset-2 transition-colors group-hover:text-text">Por quê?</span>
      </button>
      {aberto && (
        <Modal titulo="Risco de falta" descricao={`${c.paciente.nome} · ${diaCurto(c.dataConsulta)}, às ${hora(c.dataConsulta)}`} aoFechar={fechar}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {pct !== null ? <span className="text-[15px] text-muted"><span className="mr-2 text-[37.4px] font-light tracking-[-0.03em] text-text">{pct}%</span>de chance de falta</span> : <span />}
            <SeloRisco risco={c.risco} comPercentual={false} />
          </div>
          <div className="mt-5"><MotivosRisco consultaId={c.id} risco={c.risco} /></div>
          <div className="mt-5 text-[15px] font-medium">O que fazer</div>
          <p className="mb-0 mt-1 text-[14px] text-muted">{c.acaoSugerida}.</p>
          {pct !== null && <p className="mb-0 mt-4 text-[13px] text-muted [hyphens:none]">A previsão só orienta o contato e nunca cancela o atendimento.</p>}
        </Modal>
      )}
    </>
  )
}
