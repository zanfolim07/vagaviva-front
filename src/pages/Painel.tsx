import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Barras } from '../components/Barras'
import { Carregando, ErroTela } from '../components/Estados'
import { Opcoes } from '../components/Formulario'
import { useRelogio } from '../hooks/useRelogio'
import { INTERVALO_ATUALIZACAO, useAsync } from '../hooks/useAsync'
import { buscarPainel, listarUnidades } from '../services/api'
import { diaPorExtenso, hojeIso, moeda, percentual, semanaLonga } from '../utils/formatos'

function Principal({ rotulo, valor, detalhe, cor = '', borda = 'border-line' }: { rotulo: string; valor: string; detalhe: string; cor?: string; borda?: string }) {
  return (
    <div className={`vv-lift rounded-[22px] border p-7 ${borda}`}>
      <div className="text-sm text-muted">{rotulo}</div>
      <div className={`mt-1.5 text-[37.4px] font-light tracking-[-0.03em] ${cor}`}>{valor}</div>
      <div className="mt-1.5 text-[13px] text-muted">{detalhe}</div>
    </div>
  )
}

function Menor({ rotulo, valor, cor = '' }: { rotulo: string; valor: number; cor?: string }) {
  return (
    <div className="rounded-[18px] bg-surface p-5">
      <div className="text-[13.5px] text-muted">{rotulo}</div>
      <div className={`mt-1 text-[30.6px] font-light ${cor}`}>{valor}</div>
    </div>
  )
}

export default function Painel() {
  const hoje = hojeIso(useRelogio())
  const [unidade, setUnidade] = useState('todas')
  const unidadeId = unidade === 'todas' ? null : Number(unidade)
  const unidades = useAsync(listarUnidades, [])
  const { dados: p, erro, carregando, recarregar } = useAsync(() => buscarPainel(unidadeId), [unidadeId], INTERVALO_ATUALIZACAO)
  const nomeUnidade = unidadeId === null ? 'TODAS AS UNIDADES' : (unidades.dados?.find((u) => u.id === unidadeId)?.nome ?? '').toUpperCase()

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="text-xs uppercase tabular-nums tracking-[0.2em] text-muted">{nomeUnidade} · {semanaLonga(hoje)}, {diaPorExtenso(hoje)}</div>
          <h1 className="mb-0 mt-2 text-[clamp(25.6px,2.7vw,34.3px)] font-light tracking-[-0.03em]">Painel da gestão</h1>
        </div>
        <span className="rounded-full border border-mid px-3.5 py-1.5 text-[11.5px] tabular-nums text-mid">DADOS DE EXEMPLO DO BANCO</span>
      </div>

      <div className="mb-9">
        <Opcoes rotulo="Unidade" valor={unidade} onEscolher={setUnidade} opcoes={[{ id: 'todas', label: 'Todas' }, ...(unidades.dados ?? []).map((u) => ({ id: String(u.id), label: u.nome }))]} />
      </div>

      {carregando && <Carregando texto="Buscando indicadores…" linhas={4} altura="h-[132px]" />}
      {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar o painel." erro={erro} onTentar={recarregar} />}

      {!carregando && erro === null && p && (
        <>
          <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-5">
            <Principal rotulo="Taxa de faltas" valor={percentual(p.taxaFalta)} detalhe={`${p.faltas} faltas em ${p.consultas} consultas encerradas`} cor="text-danger-text" />
            <Principal rotulo="Vagas devolvidas" valor={String(p.vagasDevolvidas)} detalhe="canceladas pelo paciente ou liberadas pela recepção" cor="text-mid" />
            <Principal rotulo="Vagas recuperadas" valor={String(p.vagasRecuperadas)} detalhe="aceitas por alguém da fila" cor="text-accent-text" />
            <Principal rotulo="Valor preservado" valor={moeda(p.valorPreservado)} detalhe={`${p.vagasRecuperadas} × ${moeda(p.valorPorConsulta)} por consulta`} borda="border-accent-deep" />
          </div>

          <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-6">
            <section className="rounded-3xl border border-line p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-lg font-medium">Hoje</div>
                <Link to="/agenda" className="text-[13.5px]">Abrir agenda</Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Menor rotulo="Consultas hoje" valor={p.consultasHoje} />
                <Menor rotulo="Risco alto a contatar" valor={p.riscoAltoHoje} cor="text-danger-text" />
              </div>
              <p className="mb-0 mt-5 text-[13.5px] text-muted">Risco alto e ainda sem confirmação. A recepção liga primeiro para esses pacientes.</p>
            </section>
            <section className="rounded-3xl border border-line p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-lg font-medium">Lista de espera</div>
                <Link to="/lista-espera" className="text-[13.5px]">Abrir fila</Link>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                <Menor rotulo="Na fila" valor={p.pacientesNaFila} />
                <Menor rotulo="Ofertas abertas" valor={p.ofertasAbertas} cor="text-accent-text" />
                <Menor rotulo="Prazos vencidos" valor={p.prazosVencidos} cor="text-danger-text" />
              </div>
              <p className="mb-0 mt-5 text-[13.5px] text-muted">Prazo vencido é quem já esperou mais que o prazo máximo da sua classe de risco.</p>
            </section>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-6">
            <section className="rounded-3xl border border-line p-6 sm:p-8">
              <div className="text-lg font-medium">Vagas recuperadas por semana</div>
              <div className="mb-6 mt-1 text-[13.5px] text-muted">Semanas contadas a partir do início do período analisado</div>
              {p.porSemana.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">Nenhuma vaga recuperada no período.</div>
              ) : (
                <Barras descricao="Vagas recuperadas por semana" itens={p.porSemana.map((s) => ({ rotulo: `Semana ${s.semana}`, valor: s.recuperadas, texto: String(s.recuperadas) }))} />
              )}
            </section>
            <section className="rounded-3xl border border-line p-6 sm:p-8">
              <div className="text-lg font-medium">Taxa de faltas por especialidade</div>
              <div className="mb-6 mt-1 text-[13.5px] text-muted">Entre as consultas encerradas no período</div>
              {p.porEspecialidade.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">Sem consultas encerradas no período.</div>
              ) : (
                <Barras descricao="Taxa de faltas por especialidade" maximo={1} itens={p.porEspecialidade.map((e) => ({ rotulo: e.especialidade, valor: e.taxaFalta, texto: percentual(e.taxaFalta, 0) }))} />
              )}
            </section>
          </div>

          <p className="mb-0 mt-[18px] text-[13px] text-muted">Os números vêm da API e são atualizados a cada 30 segundos. Valor de {moeda(p.valorPorConsulta)} por consulta, a partir do estudo da Grande Vitória (Saúde em Debate, 2019).</p>
        </>
      )}
    </>
  )
}
