import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Carregando, ErroTela, Vazio, type DadosAviso } from '../components/Estados'
import { FormularioFila } from '../components/FormularioFila'
import { Opcoes } from '../components/Formulario'
import { IconeMais, IconeMais20 } from '../components/Icones'
import { Modal } from '../components/Modal'
import { Marcador, SeloClasse } from '../components/Selos'
import { useAuth } from '../context/AuthContext'
import { INTERVALO_ATUALIZACAO, useAsync } from '../hooks/useAsync'
import { aceitarOferta, listarClasses, listarEspecialidades, listarFila, listarPacientes, listarProfissionais, listarUnidades, recusarOferta, removerDaFila } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { ClasseRiscoId, ListaEspera as Pedido } from '../types'
import { diaCurto, hora } from '../utils/formatos'

const COLUNAS = 'min-[1180px]:grid-cols-[52px_minmax(260px,2fr)_minmax(230px,1.6fr)_64px_minmax(170px,1fr)_244px]'
const CABECALHO = 'text-[11px] tracking-[0.14em] text-muted'

function textoPrazo(p: Pedido) {
  const resta = p.prazoDias - p.diasEspera
  if (p.prazoVencido) return `prazo vencido há ${-resta} dias`
  return p.prazoLegal ? `lei: faltam ${resta} dias` : `faltam ${resta} de ${p.prazoDias}`
}

export default function ListaEspera() {
  const { usuario } = useAuth()
  const [unidade, setUnidade] = useState(String(usuario?.unidade.id ?? ''))
  const [aba, setAba] = useState<number | null>(null)
  const [aviso, setAviso] = useState<DadosAviso | null>(null)
  const [confirmar, setConfirmar] = useState<number | null>(null)
  const [detalhe, setDetalhe] = useState<number | null>(null)
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [incluindo, setIncluindo] = useState(false)
  const unidadeId = Number(unidade)

  const apoio = useAsync(async () => {
    const [unidades, especialidades, classes, pacientes] = await Promise.all([listarUnidades(), listarEspecialidades(), listarClasses(), listarPacientes()])
    return { unidades, especialidades, classes, pacientes }
  }, [])
  const profissionais = useAsync(() => listarProfissionais({ unidade: unidadeId }), [unidadeId])
  const { dados, erro, carregando, recarregar, atualizar } = useAsync(() => listarFila({ unidade: unidadeId }), [unidadeId], INTERVALO_ATUALIZACAO)

  const naFila = (dados ?? []).filter((p) => p.posicao !== null)
  const especialidades = apoio.dados?.especialidades ?? []
  const abaAtual = aba ?? especialidades[0]?.id ?? null
  const fila = naFila.filter((p) => p.especialidade.id === abaAtual)
  const nomeAba = especialidades.find((e) => e.id === abaAtual)?.nome ?? ''
  const nomeClasse = (id: ClasseRiscoId) => apoio.dados?.classes.find((c) => c.classe === id)?.nome

  async function executar(id: number, acao: () => Promise<DadosAviso>) {
    setOcupado(id)
    setConfirmar(null)
    try {
      setAviso(await acao())
      atualizar()
    } catch (e) {
      setAviso({ titulo: 'Não foi possível concluir a ação.', texto: mensagemDeErro(e), tipo: 'erro' })
    } finally {
      setOcupado(null)
    }
  }

  const aceitar = (p: Pedido) =>
    executar(p.id, async () => {
      await aceitarOferta(p.id)
      return { titulo: `${p.paciente.nome} aceitou a vaga`, texto: 'Consulta confirmada. O pedido sai da fila e a vaga conta como recuperada no painel.' }
    })

  const recusar = (p: Pedido) =>
    executar(p.id, async () => {
      const r = await recusarOferta(p.id)
      return { titulo: `${p.paciente.nome} recusou e continua no mesmo lugar da fila`, texto: r.novaOferta ? `A vaga foi oferecida a ${r.novaOferta.paciente.nome}, próximo compatível.` : 'Ninguém compatível na fila agora. A vaga fica livre para encaixe.' }
    })

  const fecharInclusao = useCallback(() => setIncluindo(false), [])

  function remover(p: Pedido) {
    if (confirmar !== p.id) {
      setConfirmar(p.id)
      return
    }
    void executar(p.id, async () => {
      await removerDaFila(p.id)
      return { titulo: `${p.paciente.nome} saiu da fila`, texto: 'O pedido foi removido. As posições de quem estava atrás foram atualizadas.' }
    })
  }

  const botaoFila = 'inline-flex h-11 w-[92px] items-center justify-center whitespace-nowrap rounded-full text-[13px] transition-colors disabled:opacity-60'

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 mt-0 text-[clamp(28px,2.7vw,34px)] font-light tracking-[-0.03em]">Lista de espera</h1>
        <p className="m-0 text-base text-muted">Ordenada pela gravidade e pelo tempo de espera. Quem tem prazo legal vem primeiro.</p>
      </div>

      <div className="mb-4">
        <Opcoes rotulo="Unidade" valor={unidade} onEscolher={setUnidade} opcoes={(apoio.dados?.unidades ?? []).map((u) => ({ id: String(u.id), label: u.nome }))} />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Especialidade" className="flex flex-wrap gap-2">
          {especialidades.map((e) => {
            const ativo = e.id === abaAtual
            const total = naFila.filter((p) => p.especialidade.id === e.id).length
            return (
              <button key={e.id} type="button" aria-pressed={ativo} onClick={() => { setAba(e.id); setConfirmar(null) }} className={`inline-flex min-h-12 items-center gap-2.5 rounded-[14px] border px-[18px] text-[15px] text-text transition-colors ${ativo ? 'border-accent-deep bg-surface' : 'border-line bg-transparent hover:bg-surface'}`}>
                {e.nome}
                <span className={`text-xs tabular-nums ${ativo ? 'text-accent-text' : 'text-muted'}`}>{total}</span>
              </button>
            )
          })}
        </div>
        <button type="button" onClick={() => setIncluindo(true)} className="vv-primary !min-h-12 !px-6 !text-[15px]"><IconeMais />Incluir na fila</button>
      </div>

      <div className="flex flex-col gap-5">
        {aviso && <Aviso aviso={aviso} onFechar={() => setAviso(null)} />}
        {carregando && <Carregando texto="Buscando a fila…" />}
        {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar a lista de espera." erro={erro} onTentar={recarregar} />}
        {!carregando && erro === null && fila.length === 0 && (
          <Vazio titulo="Ninguém esperando nesta especialidade.">
            <button type="button" onClick={() => setIncluindo(true)} className="vv-ghost">Incluir paciente</button>
          </Vazio>
        )}

        {!carregando && erro === null && fila.length > 0 && (
          <section aria-label="Fila" className="flex flex-col gap-3">
            <div className={`hidden gap-x-6 border border-transparent px-6 min-[1180px]:grid ${COLUNAS} ${CABECALHO}`}>
              <span className="w-12 text-center">POS.</span><span>PACIENTE</span><span>ESPERA E PRAZO</span><span>PONTOS</span><span>SITUAÇÃO</span><span className="text-right">AÇÕES</span>
            </div>
            {fila.map((p, i) => {
              const ofertada = p.status === 'OFERTADA'
              const pct = Math.round((p.diasEspera / p.prazoDias) * 100)
              const perto = !p.prazoVencido && pct >= 75
              const urgente = p.prazoVencido || p.prazoLegal
              const conf = confirmar === p.id
              const trava = ocupado === p.id
              const aberto = detalhe === p.id
              return (
                <article key={p.id} className={`vv-rise rounded-[20px] border bg-bg ${ofertada ? 'border-accent-deep' : 'border-line'}`}>
                  <div className={`grid grid-cols-[52px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 p-5 min-[1180px]:gap-x-6 min-[1180px]:px-6 ${COLUNAS}`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full border text-[17px] tabular-nums ${i === 0 ? 'border-accent-deep font-semibold text-accent-text' : 'border-line text-muted'}`}>{p.posicao}º</span>
                    <span className="flex min-w-0 flex-wrap items-center gap-2.5">
                      <span className="text-base font-medium">{p.paciente.nome}</span>
                      <SeloClasse classe={p.classeRisco} nome={nomeClasse(p.classeRisco)} />
                      {p.prazoLegal && <Marcador destaque>PRAZO LEGAL</Marcador>}
                    </span>
                    <span className="col-span-2 flex min-w-0 flex-col gap-2 min-[1180px]:col-span-1">
                      <span className="flex justify-between gap-3 whitespace-nowrap text-[13px]">
                        <span className="tabular-nums">{p.diasEspera} dias</span>
                        <span className={urgente ? 'font-semibold text-danger-text' : perto ? 'text-text' : 'text-muted'}>{textoPrazo(p)}</span>
                      </span>
                      <span role="img" aria-label={`${pct}% do prazo máximo já esperado`} className="h-1.5 overflow-hidden rounded-md bg-surface">
                        <span className={`block h-1.5 rounded-md ${urgente ? 'bg-danger' : perto ? 'bg-mid' : 'bg-accent'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </span>
                    </span>
                    <span className="col-span-2 text-lg font-semibold tabular-nums min-[1180px]:col-span-1"><span className={`${CABECALHO} mr-2 font-normal min-[1180px]:hidden`}>PONTOS</span>{p.prazoLegal ? 'Lei' : p.pontuacao}</span>
                    <span className={`col-span-2 inline-flex items-center gap-2 text-[13px] min-[1180px]:col-span-1 ${ofertada ? 'text-accent-text' : p.prazoVencido ? 'text-danger-text' : 'text-muted'}`}>
                      <span className={`h-[7px] w-[7px] flex-none rounded-full bg-current ${ofertada ? 'vv-pulse' : ''}`} />
                      {ofertada && p.dataConsultaOfertada ? `Vaga oferecida · ${hora(p.dataConsultaOfertada)}` : p.prazoVencido ? 'Prazo vencido' : 'Aguardando'}
                    </span>
                    <span className="col-span-2 flex items-center justify-end gap-2 min-[1180px]:col-span-1">
                      {ofertada && (
                        <>
                          <button type="button" disabled={trava} onClick={() => aceitar(p)} className={`${botaoFila} bg-accent font-semibold text-on-accent`}>Aceitar</button>
                          <button type="button" disabled={trava} onClick={() => recusar(p)} className={`${botaoFila} border border-line text-text`}>Recusar</button>
                        </>
                      )}
                      <button type="button" aria-expanded={aberto} aria-label={aberto ? `Fechar detalhes de ${p.paciente.nome}` : `Ver detalhes de ${p.paciente.nome}`} title="Detalhes" onClick={() => { setDetalhe(aberto ? null : p.id); setConfirmar(null) }} className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line text-text transition-colors hover:bg-surface">
                        <svg className={`transition-transform ${aberto ? 'rotate-180' : ''}`} width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </span>
                  </div>
                  {aberto && (
                    <div className="vv-drop flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-5 py-4 min-[1180px]:px-6">
                      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1 text-[13.5px] text-muted">
                        <span>Pedido de {p.solicitante.nome} · {p.profissionalPreferido ? `Só ${p.profissionalPreferido.nome}` : 'Qualquer profissional'}</span>
                        <span>{p.aceitaMesmoDia ? 'Aceita ser chamado no mesmo dia' : 'Prefere vagas com mais de 24 horas'}{p.prioridadeLegal ? ` · Prioridade legal ${p.prioridadeLegal}` : ''}</span>
                        {ofertada && p.respondaAte && <span className="text-text">Responde até {diaCurto(p.respondaAte)}, às {hora(p.respondaAte)}. Sem resposta, a vaga passa ao próximo da fila.</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/fila/${p.tokenPaciente}`} className="vv-ghost !text-[13px]">Tela do paciente</Link>
                        {!ofertada && <button type="button" disabled={trava} onClick={() => remover(p)} aria-label={conf ? `Confirmar remoção de ${p.paciente.nome}` : `Remover ${p.paciente.nome} da fila`} className={`${botaoFila} border ${conf ? 'border-danger text-danger-text' : 'border-line text-muted'}`}>{conf ? 'Confirmar?' : 'Remover'}</button>}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}

        <details className="mt-1 rounded-[20px] border border-line px-5 sm:px-6">
          <summary className="flex min-h-14 items-center justify-between gap-4 text-[15px] font-medium">
            Como a pontuação é calculada
            <IconeMais20 />
          </summary>
          <div className="grid gap-x-12 gap-y-5 pb-6 text-sm text-muted lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-[18px]">
              <li><strong className="font-semibold text-text">Prazo legal primeiro.</strong> Casos com prazo garantido em lei, como a suspeita de câncer, ficam no topo, pelo prazo mais próximo.</li>
              <li><strong className="font-semibold text-text">Pontos = peso da classe + % do prazo já esperado.</strong> Quem espera há mais tempo sobe sozinho, sem ninguém mexer na fila.</li>
              <li><strong className="font-semibold text-text">Empate:</strong> prioridade legal (80+, 60+, gestante, PcD) e depois quem entrou antes.</li>
            </ol>
            <div className="grid grid-cols-[auto_1fr_auto] content-start gap-x-4 gap-y-2.5 text-[13.5px]">
              {(apoio.dados?.classes ?? []).map((c) => (
                <div key={c.classe} className="contents">
                  <span className="font-semibold text-text">{c.classe}</span>
                  <span>{c.nome} · até {c.prazoDias} dias</span>
                  <span>peso {c.peso}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      {incluindo && (
        <Modal titulo={`Incluir na fila de ${nomeAba}`} descricao="Os dados clínicos vêm do pedido do profissional de saúde. A recepção não define nem altera a classe." aoFechar={fecharInclusao}>
          {abaAtual !== null && apoio.dados && (
            <FormularioFila
              pacientes={apoio.dados.pacientes}
              profissionais={profissionais.dados ?? []}
              classes={apoio.dados.classes}
              especialidadeId={abaAtual}
              unidadeId={unidadeId}
              textoBotao={`Incluir em ${nomeAba}`}
              onSucesso={(criado) => {
                setAviso({ titulo: `${criado.paciente.nome} entrou na fila de ${nomeAba}`, texto: `Posição ${criado.posicao}º.` })
                setIncluindo(false)
                atualizar()
              }}
            />
          )}
        </Modal>
      )}
    </>
  )
}
