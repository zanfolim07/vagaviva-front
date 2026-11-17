import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Combo } from '../components/Combo'
import { Aviso, Carregando, ErroTela, Vazio, type DadosAviso } from '../components/Estados'
import { aplicarErrosDeCampo, BotaoEnvio, Campo, Opcoes } from '../components/Formulario'
import { IconeMais } from '../components/Icones'
import { Modal } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { criarUsuario, desativarUsuario, listarUnidades, listarUsuarios, reativarUsuario, reenviarConvite } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import type { Perfil, StatusUsuario, Usuario } from '../types'
import { dataCompleta, EMAIL_VALIDO } from '../utils/formatos'

interface FormUsuario {
  nome: string
  email: string
  perfil: Perfil
  unidadeId: string
}

const SITUACAO: Record<StatusUsuario, { texto: string; cor: string }> = {
  ATIVO: { texto: 'Ativo', cor: 'text-accent-text' },
  PENDENTE: { texto: 'Convite pendente', cor: 'text-mid' },
  DESATIVADO: { texto: 'Desativado', cor: 'text-muted' },
}

const COLUNAS = 'min-[1000px]:grid-cols-[minmax(0,1.8fr)_90px_minmax(0,1fr)_minmax(0,1.6fr)]'
const CAB = 'text-[11px] tracking-[0.14em] text-muted'
const ACAO = 'vv-ghost !min-h-11 !px-3 !text-[13px]'
const PERFIS: { id: Perfil; label: string }[] = [{ id: 'RECEPCAO', label: 'Recepção' }, { id: 'GESTAO', label: 'Gestão' }]

function Kpi({ rotulo, valor, cor = '' }: { rotulo: string; valor: number; cor?: string }) {
  return (
    <div className="rounded-[20px] border border-line p-6">
      <div className="text-[13.5px] text-muted">{rotulo}</div>
      <div className={`mt-1 text-[30.6px] font-light tracking-[-0.03em] ${cor}`}>{valor}</div>
    </div>
  )
}

export default function AdminEquipe() {
  const { usuario: atual } = useAuth()
  const [aviso, setAviso] = useState<DadosAviso | null>(null)
  const [confirmar, setConfirmar] = useState<number | null>(null)
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [convite, setConvite] = useState<Usuario | null>(null)
  const [erroEmail, setErroEmail] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const { register, handleSubmit, setError, setValue, control, reset, formState: { errors, isSubmitting } } = useForm<FormUsuario>({
    defaultValues: { nome: '', email: '', perfil: 'RECEPCAO', unidadeId: String(atual?.unidade.id ?? '') },
  })
  const perfil = useWatch({ control, name: 'perfil' })

  const { dados, erro, carregando, recarregar, atualizar } = useAsync(async () => {
    const [usuarios, unidades] = await Promise.all([listarUsuarios(), listarUnidades()])
    return { usuarios, unidades }
  }, [])
  const usuarios = dados?.usuarios ?? []
  const conta = (s: StatusUsuario) => usuarios.filter((u) => u.status === s).length

  function abrir() {
    setConvite(null)
    setErroEmail('')
    setFormAberto(true)
  }

  const fechar = useCallback(() => setFormAberto(false), [])

  async function executar(u: Usuario, acao: () => Promise<Usuario>, depois: (r: Usuario) => DadosAviso) {
    setOcupado(u.id)
    setConfirmar(null)
    try {
      const r = await acao()
      setAviso(depois(r))
      atualizar()
    } catch (e) {
      setAviso({ titulo: 'Não foi possível concluir a ação.', texto: mensagemDeErro(e), tipo: 'erro' })
    } finally {
      setOcupado(null)
    }
  }

  async function cadastrar(d: FormUsuario) {
    setConvite(null)
    setErroEmail('')
    try {
      const criado = await criarUsuario({ nome: d.nome.trim(), email: d.email.trim(), perfil: d.perfil, unidadeId: Number(d.unidadeId) })
      setConvite(criado)
      reset({ nome: '', email: '', perfil: 'RECEPCAO', unidadeId: d.unidadeId })
      atualizar()
    } catch (e) {
      if (aplicarErrosDeCampo(e, setError)) return
      if (e instanceof HttpError && e.status === 409) setErroEmail(e.message)
      else setAviso({ titulo: 'Não foi possível cadastrar.', texto: mensagemDeErro(e), tipo: 'erro' })
    }
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-[760px]">
          <div className="text-xs tracking-[0.2em] text-muted">ADMINISTRAÇÃO</div>
          <h1 className="mb-2.5 mt-2.5 text-[clamp(25.6px,2.7vw,34.3px)] font-light tracking-[-0.03em]">Equipe da unidade</h1>
          <p className="m-0 text-base text-muted [hyphens:none]">Cadastre recepcionistas e gestores. Cada pessoa recebe um código de convite e cria a própria senha no primeiro acesso.</p>
        </div>
        <button type="button" onClick={abrir} className="vv-primary !min-h-11 !px-5 !text-sm"><IconeMais />Cadastrar pessoa</button>
      </div>

      {carregando && <Carregando texto="Buscando a equipe…" linhas={4} altura="h-[70px]" />}
      {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar a equipe." erro={erro} onTentar={recarregar} />}

      {!carregando && erro === null && dados && (
        <>
          <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
            <Kpi rotulo="Contas ativas" valor={conta('ATIVO')} cor="text-accent-text" />
            <Kpi rotulo="Convites pendentes" valor={conta('PENDENTE')} cor="text-mid" />
            <Kpi rotulo="Desativadas" valor={conta('DESATIVADO')} />
          </div>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[999_1_640px] flex-col gap-8">
              {aviso && <Aviso aviso={aviso} onFechar={() => setAviso(null)} />}
              {usuarios.length === 0 && <Vazio titulo="Ninguém cadastrado ainda." />}
              {usuarios.length > 0 && (
                <section aria-label="Pessoas cadastradas" className="overflow-hidden rounded-3xl border border-line">
                  <div className={`hidden gap-x-8 border-b border-line px-7 py-4 min-[1000px]:grid ${COLUNAS} ${CAB}`}>
                    <span>PESSOA</span><span>PERFIL</span><span>SITUAÇÃO</span><span>AÇÕES</span>
                  </div>
                  {usuarios.map((u) => {
                    const voce = u.id === atual?.id
                    const situacao = SITUACAO[u.status]
                    const trava = ocupado === u.id
                    return (
                      <div key={u.id} className={`grid grid-cols-2 items-center gap-x-8 gap-y-4 border-b border-surface px-5 py-6 last:border-0 sm:px-7 ${COLUNAS} ${u.status === 'DESATIVADO' ? 'opacity-60' : ''}`}>
                        <span className="col-span-2 flex min-w-0 flex-col gap-1 min-[1000px]:col-span-1">
                          <span className="text-[15.5px] font-medium">{u.nome}</span>
                          <span className="text-[13px] text-muted [overflow-wrap:anywhere]">{u.email}</span>
                          <span className="text-xs text-muted">{u.unidade.nome}</span>
                        </span>
                        <span className="text-sm">{u.perfil === 'GESTAO' ? 'Gestão' : 'Recepção'}</span>
                        <span className={`inline-flex flex-wrap items-center gap-2 text-[13.5px] ${situacao.cor}`}>
                          <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />
                          {situacao.texto}
                          {u.codigoConvite && <span className="tabular-nums text-muted">{u.codigoConvite}</span>}
                        </span>
                        <span className="col-span-2 flex flex-wrap items-center gap-2.5 min-[1000px]:col-span-1">
                          {voce && <span className="text-[13px] text-muted">Você</span>}
                          {confirmar === u.id ? (
                            <span role="group" aria-label="Confirmar desativação" className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[13px]">Desativar acesso?</span>
                              <button type="button" disabled={trava} onClick={() => executar(u, () => desativarUsuario(u.id), (r) => ({ titulo: `${r.nome} foi desativado`, texto: 'A conta perdeu o acesso na hora.' }))} className="min-h-11 rounded-full bg-danger px-3 text-[13px] font-semibold text-on-accent">Sim</button>
                              <button type="button" onClick={() => setConfirmar(null)} className={ACAO}>Não</button>
                            </span>
                          ) : (
                            <>
                              {u.status === 'PENDENTE' && <button type="button" disabled={trava} onClick={() => executar(u, () => reenviarConvite(u.id), (r) => ({ titulo: `Novo convite para ${r.nome}`, texto: `Código ${r.codigoConvite}, válido até ${r.expiracaoConvite ? dataCompleta(r.expiracaoConvite) : ''}.` }))} className={ACAO}>Reenviar convite</button>}
                              {u.status !== 'DESATIVADO' && !voce && <button type="button" disabled={trava} onClick={() => setConfirmar(u.id)} aria-label={`Desativar ${u.nome}`} className={ACAO}>Desativar</button>}
                              {u.status === 'DESATIVADO' && <button type="button" disabled={trava} onClick={() => executar(u, () => reativarUsuario(u.id), (r) => ({ titulo: `${r.nome} foi reativado`, texto: r.codigoConvite ? `Novo convite: ${r.codigoConvite}.` : 'A pessoa já pode entrar com a própria senha.' }))} className={ACAO}>Reativar</button>}
                            </>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </section>
              )}
              <section className="rounded-3xl border border-line p-6 text-sm text-muted sm:p-8">
                <div className="mb-3 font-semibold text-text">Regras de acesso</div>
                <p className="mb-3 mt-0">Recepção vê agenda, consultas, pacientes, lista de espera e painel. Gestão vê tudo isso e esta tela de equipe.</p>
                <p className="m-0">Quem sai da unidade deve ser desativado no mesmo dia. A conta desativada perde o acesso na hora.</p>
              </section>
            </div>
          </div>
        </>
      )}
      {formAberto && dados && (
        <Modal titulo={convite ? 'Convite criado' : 'Cadastrar pessoa'} descricao={convite ? undefined : 'Os campos marcados com * são obrigatórios.'} aoFechar={fechar}>
          {convite ? (
            <div role="status" className="flex flex-col gap-3">
              <span className="text-[14.5px]">Convite para <strong className="font-medium">{convite.email}</strong></span>
              <span className="text-[34px] font-light tabular-nums tracking-[0.04em] text-accent-text">{convite.codigoConvite}</span>
              <p className="m-0 text-[13px] text-muted">Código válido até {convite.expiracaoConvite ? dataCompleta(convite.expiracaoConvite) : ''}. Entregue à pessoa, que ativa a conta em “Primeiro acesso”, na tela de login.</p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                <button type="button" onClick={abrir} className="vv-primary !min-h-12 !px-6 !text-[15px]">Cadastrar outra pessoa</button>
                <button type="button" onClick={fechar} className="vv-ghost !min-h-12 !px-6 !text-[15px]">Fechar</button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-4">
                  <Campo id="a-nome" rotulo="Nome completo" obrigatorio erro={errors.nome?.message}>
                    <input id="a-nome" className="vv-in" autoComplete="off" aria-invalid={!!errors.nome} {...register('nome', { validate: (v) => v.trim().split(/\s+/).length >= 2 || 'Digite nome e sobrenome.' })} />
                  </Campo>
                  <Campo id="a-email" rotulo="E-mail institucional" obrigatorio erro={errors.email?.message ?? erroEmail}>
                    <input id="a-email" type="email" autoComplete="off" placeholder="nome@saude.sp.gov.br" className="vv-in" aria-invalid={!!errors.email || !!erroEmail} {...register('email', { validate: (v) => EMAIL_VALIDO.test(v.trim()) || 'Digite um e-mail válido.', onChange: () => setErroEmail('') })} />
                  </Campo>
                  <div>
                    <span className="vv-lbl">Perfil<span className="text-danger-text"> *</span></span>
                    <Opcoes rotulo="Perfil" opcoes={PERFIS} valor={perfil} onEscolher={(v) => setValue('perfil', v)} className="grid grid-cols-2 gap-1.5" botaoClassName="min-h-[46px] rounded-xl text-sm" />
                    <p className="vv-help">{perfil === 'GESTAO' ? 'Gestão vê tudo e pode cadastrar pessoas.' : 'Recepção vê agenda, consultas, pacientes, lista de espera e painel.'}</p>
                  </div>
                  <Campo id="a-unid" rotulo="Unidade" obrigatorio>
                    <Controller name="unidadeId" control={control} rules={{ required: true }} render={({ field }) => (
                      <Combo id="a-unid" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} opcoes={dados.unidades.map((u) => ({ valor: String(u.id), rotulo: u.nome }))} />
                    )} />
                  </Campo>
                  <div className="flex flex-wrap gap-2.5">
                    <BotaoEnvio enviando={isSubmitting} texto="Cadastrar e gerar convite" textoEnviando="Cadastrando…" className="flex-[1_1_200px] !text-[15px]" />
                    <button type="button" onClick={fechar} className="vv-ghost !min-h-[52px] !px-5 !text-[15px]">Cancelar</button>
                  </div>
                </form>
          )}
        </Modal>
      )}
    </>
  )
}
