import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { CampoData } from '../components/CampoData'
import { CampoHora } from '../components/CampoHora'
import { Combo } from '../components/Combo'
import { Carregando, ErroTela, Spinner } from '../components/Estados'
import { FormularioFila } from '../components/FormularioFila'
import { aplicarErrosDeCampo, BotaoEnvio, Campo } from '../components/Formulario'
import { IconeCheck, IconeVoltar } from '../components/Icones'
import { Modal } from '../components/Modal'
import { MotivosRisco } from '../components/PorQueRisco'
import { CORES_NIVEL, SeloRisco } from '../components/Selos'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { agendarConsulta, horariosLivres, listarClasses, listarEspecialidades, listarPacientes, listarProfissionais } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import type { Consulta, ListaEspera } from '../types'
import { agoraIso, CANAIS, cartaoSus, dataCompleta, diaCurto, hojeIso, hora, riscoPercentual, somarDias, telefone } from '../utils/formatos'

interface FormConsulta {
  pacienteId: string
  especialidadeId: string
  profissionalId: string
  data: string
  hora: string
  lembrete: boolean
}

function LinhaResumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-3 text-[14.5px] last:border-0">
      <span className="text-muted">{rotulo}</span>
      <span className="text-right">{valor}</span>
    </div>
  )
}

export default function NovaConsulta() {
  const { usuario } = useAuth()
  const [params] = useSearchParams()
  const [salva, setSalva] = useState<Consulta | null>(null)
  const [erroGeral, setErroGeral] = useState('')
  const [abrirFila, setAbrirFila] = useState(false)
  const [naFila, setNaFila] = useState<ListaEspera | null>(null)
  const { register, handleSubmit, setError, setValue, control, reset, clearErrors, formState: { errors, isSubmitting } } = useForm<FormConsulta>({
    defaultValues: { pacienteId: params.get('paciente') ?? '', especialidadeId: '', profissionalId: '', data: '', hora: '', lembrete: true },
  })
  const v = useWatch({ control }) as FormConsulta
  const unidade = usuario?.unidade.id

  const base = useAsync(async () => {
    const [pacientes, especialidades, classes] = await Promise.all([listarPacientes(), listarEspecialidades(), listarClasses()])
    return { pacientes, especialidades, classes }
  }, [])
  const profissionais = useAsync(() => listarProfissionais({ unidade, especialidade: v.especialidadeId ? Number(v.especialidadeId) : null }), [unidade, v.especialidadeId])
  const livres = useAsync(
    () => (v.profissionalId && v.data ? horariosLivres(Number(v.profissionalId), v.data) : Promise.resolve<string[]>([])),
    [v.profissionalId, v.data],
  )

  const paciente = base.dados?.pacientes.find((p) => String(p.id) === v.pacienteId)
  const profissional = profissionais.dados?.find((p) => String(p.id) === v.profissionalId)
  const especialidade = base.dados?.especialidades.find((e) => String(e.id) === v.especialidadeId)
  const primeira = paciente?.primeiraConsulta ?? false
  const lembrete = primeira || v.lembrete
  const horariosDoDia = (livres.dados ?? []).filter((h) => `${v.data}T${h}:00` > agoraIso())
  const semHorario = !!v.profissionalId && !!v.data && !livres.carregando && livres.erro === null && livres.dados !== null && horariosDoDia.length === 0

  const proximosDias = useAsync(async () => {
    if (!semHorario) return []
    const achados: { data: string; total: number }[] = []
    for (let i = 1; i <= 14 && achados.length < 3; i++) {
      const data = somarDias(v.data, i)
      const horarios = await horariosLivres(Number(v.profissionalId), data)
      if (horarios.length > 0) achados.push({ data, total: horarios.length })
    }
    return achados
  }, [semHorario, v.profissionalId, v.data])

  const fecharFila = useCallback(() => setAbrirFila(false), [])
  const especialidadeDaFila = especialidade ?? profissional?.especialidades[0]

  function pedirFila() {
    if (!v.pacienteId) {
      setError('pacienteId', { type: 'manual', message: 'Selecione o paciente para incluir na lista de espera.' })
      document.getElementById('n-pac')?.focus()
      return
    }
    setAbrirFila(true)
  }

  function outroDia(data: string) {
    setValue('data', data, { shouldDirty: true })
    setValue('hora', '')
    clearErrors('data')
    if (!data) document.getElementById('n-data')?.focus()
  }

  async function salvar(dados: FormConsulta) {
    setErroGeral('')
    try {
      const consulta = await agendarConsulta(Number(dados.pacienteId), {
        profissionalId: Number(dados.profissionalId),
        especialidadeId: dados.especialidadeId ? Number(dados.especialidadeId) : undefined,
        dataConsulta: `${dados.data}T${dados.hora}:00`,
        lembrete: primeira || dados.lembrete,
      })
      setSalva(consulta)
    } catch (e) {
      if (e instanceof HttpError && e.status === 409 && e.corpo?.erro === 'Horário ocupado') {
        setError('hora', { type: 'api', message: e.message })
      } else if (!aplicarErrosDeCampo(e, setError, { dataConsulta: 'data', profissionalId: 'profissionalId' })) {
        setErroGeral(mensagemDeErro(e))
      }
    }
  }

  function outra() {
    reset({ pacienteId: '', especialidadeId: '', profissionalId: '', data: '', hora: '', lembrete: true })
    setSalva(null)
    setNaFila(null)
  }

  const escolherHora = (h: string) => {
    setValue('hora', h, { shouldDirty: true })
    clearErrors('hora')
  }

  return (
    <>
      <Link to="/agenda" className="mb-4 inline-flex items-center gap-1.5 text-sm !text-muted no-underline"><IconeVoltar />Voltar para a agenda</Link>
      <h1 className="mb-2 mt-0 text-[clamp(25.6px,2.7vw,34.3px)] font-light tracking-[-0.03em]">Nova consulta</h1>
      <p className="mb-8 mt-0 text-base text-muted">Ao salvar, a Vaga Viva calcula o risco de falta e sugere o tipo de contato.</p>

      {base.carregando && <Carregando texto="Buscando pacientes e especialidades…" linhas={3} />}
      {!base.carregando && base.erro !== null && <ErroTela titulo="Não foi possível abrir o formulário." erro={base.erro} onTentar={base.recarregar} />}

      {base.dados && (
        <div className="flex flex-wrap items-start gap-6">
          <section aria-label="Formulário" className="min-w-0 flex-[999_1_560px] rounded-[26px] border border-line p-5 sm:p-8">
            {naFila ? (
              <div role="status" className="vv-rise flex flex-col gap-[22px]">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={22} /></span>
                  <div>
                    <div className="text-[22px] font-medium">Paciente na lista de espera</div>
                    <div className="text-[14.5px] text-muted">{naFila.paciente.nome} entrou na fila de {naFila.especialidade.nome}, na posição {naFila.posicao}º. Quando abrir uma vaga, ela é oferecida pela ordem da fila.</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/lista-espera" className="vv-primary !min-h-12 !px-[22px] !text-[15px]">Ver lista de espera</Link>
                  <button type="button" onClick={outra} className="vv-ghost !min-h-12 !px-[22px] !text-[15px]">Agendar outra</button>
                </div>
              </div>
            ) : salva ? (
              <div role="status" className="vv-rise flex flex-col gap-[22px]">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={22} /></span>
                  <div>
                    <div className="text-[22px] font-medium">Consulta agendada</div>
                    <div className="text-[14.5px] text-muted">{salva.paciente.nome} · {dataCompleta(salva.dataConsulta)} às {hora(salva.dataConsulta)} · {salva.profissional.nome}</div>
                  </div>
                </div>
                <div className={`rounded-[20px] border p-[22px] ${CORES_NIVEL[salva.risco.nivel].split(' ').filter((c) => c.startsWith('border')).join(' ')}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11.5px] tracking-[0.18em] text-muted">RISCO DE FALTA</span>
                    <SeloRisco risco={salva.risco} comPercentual={false} />
                  </div>
                  {riscoPercentual(salva.risco) !== null && (
                    <>
                      <div className="mt-1.5 text-[37.4px] font-light tracking-[-0.03em]">{riscoPercentual(salva.risco)}%</div>
                      <div className="mt-2 h-1.5 rounded-md bg-line"><div className="vv-bar h-1.5 rounded-md bg-accent" style={{ width: `${riscoPercentual(salva.risco)}%` }} /></div>
                    </>
                  )}
                  <div className="mt-3.5"><MotivosRisco consultaId={salva.id} risco={salva.risco} /></div>
                  <div className="mt-3 text-sm text-muted">{salva.acaoSugerida}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/agenda" className="vv-primary !min-h-12 !px-[22px] !text-[15px]">Ver na agenda</Link>
                  <button type="button" onClick={outra} className="vv-ghost !min-h-12 !px-[22px] !text-[15px]">Agendar outra</button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit(salvar)} className="flex flex-col gap-[22px]">
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <label htmlFor="n-pac" className="text-sm font-medium">Paciente<span className="text-danger-text"> *</span></label>
                    <Link to="/pacientes" className="text-[13.5px]">Paciente novo? Cadastrar</Link>
                  </div>
                  <Controller name="pacienteId" control={control} rules={{ required: 'Selecione o paciente.' }} render={({ field }) => (
                    <Combo id="n-pac" placeholder="Digite o nome ou o Cartão SUS" invalido={!!errors.pacienteId} valor={field.value} onChange={(valor) => { field.onChange(valor); if (valor) clearErrors('pacienteId') }} onBlur={field.onBlur} opcoes={base.dados!.pacientes.map((p) => ({ valor: String(p.id), rotulo: p.nome, detalhe: `Cartão SUS ${cartaoSus(p.cartaoSus)}${p.primeiraConsulta ? ' · 1ª consulta' : ''}` }))} />
                  )} />
                  {errors.pacienteId && <p className="vv-err">{errors.pacienteId.message}</p>}
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
                  <Campo id="n-esp" rotulo={<>Especialidade <span className="font-normal text-muted">(filtra os profissionais)</span></>}>
                    <Controller name="especialidadeId" control={control} render={({ field }) => (
                      <Combo id="n-esp" valor={field.value} onBlur={field.onBlur} onChange={(valor) => { field.onChange(valor); setValue('profissionalId', ''); setValue('hora', '') }} opcoes={[{ valor: '', rotulo: 'Todas' }, ...base.dados!.especialidades.map((e) => ({ valor: String(e.id), rotulo: e.nome }))]} />
                    )} />
                  </Campo>
                  <Campo id="n-prof" rotulo="Profissional" obrigatorio erro={errors.profissionalId?.message}>
                    <Controller name="profissionalId" control={control} rules={{ required: 'Selecione o profissional.' }} render={({ field }) => (
                      <Combo id="n-prof" placeholder="Digite ou escolha" invalido={!!errors.profissionalId} valor={field.value} onBlur={field.onBlur} onChange={(valor) => { field.onChange(valor); setValue('hora', '') }} opcoes={(profissionais.dados ?? []).map((p) => ({ valor: String(p.id), rotulo: p.nome, detalhe: p.especialidades.map((e) => e.nome).join(' e ') }))} />
                    )} />
                  </Campo>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
                  <Campo id="n-data" rotulo="Data" obrigatorio erro={errors.data?.message}>
                    <Controller name="data" control={control} rules={{ required: 'Escolha a data da consulta.', validate: (d) => d >= hojeIso() || 'Escolha uma data futura.' }} render={({ field }) => (
                      <CampoData id="n-data" min={hojeIso()} invalido={!!errors.data} valor={field.value} onBlur={field.onBlur} onChange={(valor) => { field.onChange(valor); setValue('hora', '') }} />
                    )} />
                  </Campo>
                  {!semHorario && <div>
                    <label htmlFor="n-hora" className="vv-lbl">Horário<span className="text-danger-text"> *</span></label>
                    {v.profissionalId && v.data && (
                      <div role="group" aria-label="Horários livres" className="mb-2 flex flex-wrap gap-1.5">
                        {livres.carregando && <span className="flex items-center gap-2 text-[13px] text-muted"><Spinner />Buscando horários…</span>}
                        {!livres.carregando && horariosDoDia.map((h) => {
                          const ativo = h === v.hora
                          return <button key={h} type="button" aria-pressed={ativo} onClick={() => escolherHora(h)} className={`min-h-11 rounded-[10px] border px-3 text-[13.5px] tabular-nums ${ativo ? 'border-accent-text bg-accent text-[#0b0b0b]' : 'border-line bg-surface text-text'}`}>{h}</button>
                        })}
                      </div>
                    )}
                    <Controller name="hora" control={control} rules={{ required: 'Escolha um horário.', validate: (h, f) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(h) ? !f.data || `${f.data}T${h}:00` > agoraIso() || 'Escolha um horário futuro.' : 'Digite o horário no formato 00:00.') }} render={({ field }) => (
                      <CampoHora id="n-hora" invalido={!!errors.hora} valor={field.value} onBlur={field.onBlur} onChange={(valor) => { field.onChange(valor); clearErrors('hora') }} />
                    )} />
                    {errors.hora && <p role="alert" className="vv-err">{errors.hora.message}</p>}
                  </div>}
                </div>

                {semHorario && (
                  <div role="status" className="vv-rise rounded-[18px] border border-mid p-5">
                    <div className="text-[15.5px] font-semibold">Sem horários com {profissional?.nome ?? 'este profissional'} em {dataCompleta(v.data)}.</div>
                    <p className="mb-0 mt-1 text-sm text-muted">Não dá para marcar neste dia. O paciente prefere outro dia ou entrar na lista de espera?</p>
                    {proximosDias.dados && proximosDias.dados.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 text-[13px] text-muted">Próximos dias com horário</div>
                        <div className="flex flex-wrap gap-2">
                          {proximosDias.dados.map((d) => (
                            <button key={d.data} type="button" onClick={() => outroDia(d.data)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent-deep px-3.5 text-[13.5px] text-text transition-colors hover:bg-surface">
                              <span className="capitalize">{diaCurto(d.data)}</span>
                              <span className="text-muted">{d.total} {d.total === 1 ? 'horário' : 'horários'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {proximosDias.carregando && <div className="mt-4 flex items-center gap-2 text-[13px] text-muted"><Spinner />Procurando os próximos dias…</div>}
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button type="button" onClick={pedirFila} className="vv-primary !min-h-11 !px-5 !text-sm">Colocar na lista de espera</button>
                      <button type="button" onClick={() => outroDia('')} className="vv-ghost">Escolher outro dia</button>
                    </div>
                  </div>
                )}

                <div className="rounded-[18px] border border-line bg-bg px-5 py-[18px]">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">Contato do paciente</span>
                    <Link to="/pacientes" className="text-[13.5px]">Editar no cadastro</Link>
                  </div>
                  {paciente ? (
                    <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3 text-[14.5px]">
                      <div><div className="text-[12.5px] text-muted">Canal preferido</div><div>{CANAIS[paciente.canalContato]}</div></div>
                      <div><div className="text-[12.5px] text-muted">Celular</div><div className="tabular-nums">{telefone(paciente.telefone)}</div></div>
                      <div><div className="text-[12.5px] text-muted">Telefone de familiar</div><div className="tabular-nums">{telefone(paciente.telefoneFamiliar)}</div></div>
                    </div>
                  ) : (
                    <p className="mb-0 mt-2.5 text-[13.5px] text-muted">Selecione o paciente para ver o canal de contato. Sem resposta, o sistema tenta o próximo canal: WhatsApp, SMS e, por fim, ligação da recepção.</p>
                  )}
                </div>

                <div>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                    <input type="checkbox" disabled={primeira} className="h-5 w-5 accent-[#2bd47d]" {...register('lembrete')} checked={lembrete} />
                    Enviar mensagem de confirmação ao paciente
                  </label>
                  {primeira && <p className="mb-0 ml-8 mt-0.5 text-[13px] text-muted">Na primeira consulta a mensagem é sempre enviada, porque a estimativa de risco tem menos informação.</p>}
                </div>

                {erroGeral && <div role="alert" className="rounded-[14px] border border-danger px-4 py-3.5 text-sm"><b className="font-semibold">Não foi possível agendar agora.</b> <span className="text-muted">{erroGeral}</span></div>}

                <div className="flex flex-wrap gap-3 border-t border-line pt-2">
                  {!semHorario && <BotaoEnvio enviando={isSubmitting} texto="Agendar e calcular risco" textoEnviando="Calculando risco…" />}
                  <Link to="/agenda" className="vv-ghost !min-h-[52px] !px-[22px] !text-[15px]">Cancelar</Link>
                </div>
              </form>
            )}
          </section>

          <aside className="w-full flex-[1_1_300px] rounded-[26px] border border-line bg-bg p-[26px]">
            <div className="mb-4 text-[11.5px] tracking-[0.18em] text-muted">RESUMO</div>
            <div className="flex flex-col">
              <LinhaResumo rotulo="Paciente" valor={paciente?.nome ?? '—'} />
              <LinhaResumo rotulo="Especialidade" valor={especialidade?.nome ?? (profissional?.especialidades[0]?.nome ?? '—')} />
              <LinhaResumo rotulo="Profissional" valor={profissional?.nome ?? '—'} />
              <LinhaResumo rotulo="Data" valor={v.data ? dataCompleta(v.data) : '—'} />
              <LinhaResumo rotulo="Horário" valor={v.hora || '—'} />
              <LinhaResumo rotulo="Mensagem de confirmação" valor={lembrete ? 'Sim' : 'Não'} />
              <LinhaResumo rotulo="Contato" valor={paciente ? CANAIS[paciente.canalContato] : '—'} />
            </div>
            <p className="mb-0 mt-[18px] text-[13.5px] text-muted">Agendamentos com muita antecedência e sem lembrete tendem a ter mais faltas. O risco só define a ordem e a insistência do contato: nenhuma consulta é cancelada pelo sistema.</p>
          </aside>
        </div>
      )}
      {abrirFila && base.dados && profissional && especialidadeDaFila && (
        <Modal titulo={`Lista de espera de ${especialidadeDaFila.nome}`} descricao={`Unidade: ${profissional.unidade.nome}. Os dados clínicos vêm do pedido do profissional de saúde.`} aoFechar={fecharFila}>
          <FormularioFila
            pacientes={base.dados.pacientes}
            profissionais={profissionais.dados ?? []}
            classes={base.dados.classes}
            especialidadeId={especialidadeDaFila.id}
            unidadeId={profissional.unidade.id}
            textoBotao="Incluir na lista de espera"
            inicial={{ pacienteId: v.pacienteId, profissionalSolicitanteId: v.profissionalId }}
            onSucesso={(pedido) => {
              setAbrirFila(false)
              setNaFila(pedido)
            }}
          />
        </Modal>
      )}
    </>
  )
}
