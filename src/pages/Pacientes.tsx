import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { CampoData } from '../components/CampoData'
import { Combo } from '../components/Combo'
import { Aviso, Carregando, ErroTela, Vazio, type DadosAviso } from '../components/Estados'
import { aplicarErrosDeCampo, BotaoEnvio, Campo, Opcoes } from '../components/Formulario'
import { IconeMais } from '../components/Icones'
import { Modal } from '../components/Modal'
import { useAsync } from '../hooks/useAsync'
import { atualizarPaciente, criarPaciente, listarPacientes, listarUnidades, removerPaciente } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import type { CanalContato, Paciente } from '../types'
import { CANAIS, CARTAO_VALIDO, cartaoSus, diaCurto, hojeIso, hora, idade, normalizar, telefone, TELEFONE_VALIDO } from '../utils/formatos'

interface FormPaciente {
  nome: string
  cartaoSus: string
  dataNascimento: string
  telefone: string
  bairro: string
  canalContato: CanalContato
  telefoneFamiliar: string
}

const VAZIO: FormPaciente = { nome: '', cartaoSus: '', dataNascimento: '', telefone: '', bairro: '', canalContato: 'WHATSAPP', telefoneFamiliar: '' }
const OPCOES_CANAL = (Object.keys(CANAIS) as CanalContato[]).map((id) => ({ id, label: CANAIS[id] }))
const COLUNAS = 'min-[1000px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)_56px_minmax(0,1.3fr)_minmax(0,1.1fr)_248px]'

export default function Pacientes() {
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<number | null>(null)
  const [confirmar, setConfirmar] = useState<number | null>(null)
  const [aviso, setAviso] = useState<DadosAviso | null>(null)
  const [formAberto, setFormAberto] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const { register, handleSubmit, setError, setValue, control, reset, formState: { errors, isSubmitting } } = useForm<FormPaciente>({ defaultValues: VAZIO })

  const canal = useWatch({ control, name: 'canalContato' })

  const { dados: lista, erro, carregando, recarregar, atualizar } = useAsync(() => listarPacientes(), [])

  const unidades = useAsync(listarUnidades, [])

  const bairros = useMemo(() => {
    const nomes = [...(lista ?? []).map((p) => p.bairro), ...(unidades.dados ?? []).map((u) => u.bairro)]
    return [...new Set(nomes.filter((n): n is string => !!n))].sort((a, b) => a.localeCompare(b)).map((n) => ({ valor: n, rotulo: n }))
  }, [lista, unidades.dados])

  const pacientes = useMemo(() => {
    const termo = normalizar(busca.trim())
    const digitos = busca.replace(/\D/g, '')
    return (lista ?? []).filter((p) => normalizar(p.nome).includes(termo) || (digitos !== '' && p.cartaoSus.includes(digitos)))
  }, [lista, busca])

  const fechar = useCallback(() => setFormAberto(false), [])

  function novo() {
    setEditando(null)
    setErroForm('')
    reset(VAZIO)
    setFormAberto(true)
  }

  function editar(p: Paciente) {
    setEditando(p.id)
    setErroForm('')
    setFormAberto(true)
    reset({ nome: p.nome, cartaoSus: p.cartaoSus, dataNascimento: p.dataNascimento, telefone: p.telefone, bairro: p.bairro ?? '', canalContato: p.canalContato, telefoneFamiliar: p.telefoneFamiliar ?? '' })
  }

  async function salvar(d: FormPaciente) {
    setErroForm('')
    const corpo = { ...d, nome: d.nome.trim(), bairro: d.bairro.trim() || null, telefoneFamiliar: d.telefoneFamiliar || null }
    try {
      if (editando !== null) {
        await atualizarPaciente(editando, corpo)
        setAviso({ titulo: 'Alterações salvas.', texto: `O cadastro de ${corpo.nome} foi atualizado.` })
      } else {
        const criado = await criarPaciente(corpo)
        setAviso({ titulo: `${criado.nome} foi cadastrado.`, texto: 'Já é possível agendar uma consulta.' })
      }
      setFormAberto(false)
      atualizar()
    } catch (e) {
      if (e instanceof HttpError && e.status === 409 && e.message.includes('Cartão SUS')) {
        setError('cartaoSus', { type: 'api', message: e.message })
      } else if (!aplicarErrosDeCampo(e, setError)) {
        setErroForm(mensagemDeErro(e))
      }
    }
  }

  async function remover(p: Paciente) {
    if (confirmar !== p.id) {
      setConfirmar(p.id)
      return
    }
    setConfirmar(null)
    try {
      await removerPaciente(p.id)
      setAviso({ titulo: `${p.nome} foi removido.`, texto: 'O cadastro não tinha consultas nem pedidos na fila.' })
      atualizar()
    } catch (e) {
      setAviso({ titulo: `Não foi possível remover ${p.nome}.`, texto: mensagemDeErro(e), tipo: 'erro' })
    }
  }

  const titulo = 'text-[11px] tracking-[0.14em] text-muted'
  const rotuloCard = `${titulo} min-[1000px]:hidden`

  return (
    <>
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="text-xs tracking-[0.2em] text-muted">CADASTRO</div>
          <h1 className="mb-0 mt-2 text-[clamp(25.6px,2.7vw,34.3px)] font-light tracking-[-0.03em]">Pacientes</h1>
        </div>
        <button type="button" onClick={novo} className="vv-primary !min-h-11 !px-5 !text-sm"><IconeMais />Novo paciente</button>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="Lista de pacientes" className="flex min-w-0 flex-[999_1_640px] flex-col gap-6">
          <div role="search">
            <label htmlFor="p-busca" className="sr-only">Buscar por nome ou Cartão SUS</label>
            <input id="p-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou Cartão SUS" className="vv-in !min-h-12 !rounded-full !px-[18px] !text-[15px]" />
          </div>

          {aviso && <Aviso aviso={aviso} onFechar={() => setAviso(null)} />}
          {carregando && <Carregando texto="Buscando pacientes…" linhas={3} altura="h-[70px]" />}
          {!carregando && erro !== null && <ErroTela titulo="Não foi possível carregar os pacientes." erro={erro} onTentar={recarregar} />}
          {!carregando && erro === null && pacientes.length === 0 && (
            <Vazio titulo={busca.trim() ? `Nenhum paciente encontrado para “${busca.trim()}”.` : 'Nenhum paciente cadastrado.'} texto="Confira o nome ou o número do Cartão SUS, ou cadastre um paciente novo.">
              {busca.trim() && <button type="button" onClick={() => setBusca('')} className="vv-ghost">Mostrar todos</button>}
              <button type="button" onClick={novo} className="vv-primary !min-h-11 !px-4 !text-[13.5px]">Cadastrar paciente</button>
            </Vazio>
          )}

          {!carregando && erro === null && pacientes.length > 0 && (
            <>
              <div className="overflow-hidden rounded-[22px] border border-line">
                <div className={`hidden gap-x-6 border-b border-line px-6 py-4 min-[1000px]:grid ${COLUNAS} ${titulo}`}>
                  <span>PACIENTE</span><span>CARTÃO SUS</span><span>IDADE</span><span>PRÓXIMA CONSULTA</span><span>CONTATO</span><span className="text-right">AÇÕES</span>
                </div>
                {pacientes.map((p) => {
                  const conf = confirmar === p.id
                  return (
                    <div key={p.id} className={`grid grid-cols-2 items-center gap-x-6 gap-y-4 border-b border-surface px-5 py-5 last:border-0 sm:px-6 transition-colors hover:bg-surface ${COLUNAS}`}>
                      <span className="col-span-2 flex min-w-0 flex-col gap-0.5 min-[1000px]:col-span-1">
                        <span className="text-[15px] font-medium">{p.nome}</span>
                        <span className="text-[12.5px] text-muted">{p.primeiraConsulta ? 'Sem histórico de consultas' : 'Já tem consultas encerradas'}</span>
                      </span>
                      <span className="text-sm tabular-nums"><span className={`${rotuloCard} block`}>CARTÃO SUS</span>{cartaoSus(p.cartaoSus)}</span>
                      <span className="text-sm tabular-nums"><span className={`${rotuloCard} block`}>IDADE</span>{idade(p.dataNascimento)}</span>
                      <span className="col-span-2 flex min-w-0 flex-col gap-0.5 text-[13.5px] min-[1000px]:col-span-1">
                        <span className={rotuloCard}>PRÓXIMA CONSULTA</span>
                        {p.proximaConsulta ? (
                          <Link to={`/consultas/${p.proximaConsultaId}`} className="no-underline hover:underline">
                            <span className="block capitalize">{diaCurto(p.proximaConsulta)}</span>
                            <span className="block tabular-nums text-muted">às {hora(p.proximaConsulta)}</span>
                          </Link>
                        ) : (
                          <span className="text-muted">Sem consulta marcada</span>
                        )}
                      </span>
                      <span className="col-span-2 flex min-w-0 flex-col gap-0.5 text-[13.5px] min-[1000px]:col-span-1">
                        <span className={rotuloCard}>CONTATO</span>
                        <span>{CANAIS[p.canalContato]}{p.telefoneFamiliar ? ' · familiar' : ''}</span>
                        <span className="tabular-nums text-muted">{telefone(p.telefone)}</span>
                      </span>
                      <span className="col-span-2 flex gap-1.5 min-[1000px]:col-span-1 min-[1000px]:justify-end">
                        <button type="button" onClick={() => editar(p)} className="h-11 w-[76px] rounded-full border border-line text-[12.5px] text-text transition-colors hover:bg-surface">Editar</button>
                        <Link to={`/consultas/nova?paciente=${p.id}`} className="inline-flex h-11 w-[76px] items-center justify-center rounded-full border border-accent-deep text-[12.5px] !text-accent-text no-underline">Agendar</Link>
                        <button type="button" onClick={() => remover(p)} aria-label={conf ? `Confirmar remoção de ${p.nome}` : `Remover ${p.nome}`} className={`h-11 w-[76px] rounded-full border text-[12.5px] ${conf ? 'border-danger text-danger-text' : 'border-line text-muted'}`}>{conf ? 'Confirmar' : 'Remover'}</button>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="text-[13px] text-muted">{pacientes.length} {pacientes.length === 1 ? 'paciente' : 'pacientes'}</div>
            </>
          )}
        </section>
      </div>
      {formAberto && (
        <Modal titulo={editando !== null ? 'Editar paciente' : 'Novo paciente'} descricao={editando !== null ? 'As mudanças valem para as próximas mensagens de confirmação.' : 'Os campos marcados com * são obrigatórios.'} aoFechar={fechar}>
          <form noValidate onSubmit={handleSubmit(salvar)} className="flex flex-col gap-4">
            <Campo id="f-nome" rotulo="Nome completo" obrigatorio erro={errors.nome?.message}>
              <input id="f-nome" className="vv-in" autoComplete="off" aria-invalid={!!errors.nome} {...register('nome', { validate: (v) => v.trim() !== '' || 'Informe o nome do paciente.', maxLength: { value: 100, message: 'O nome deve ter no máximo 100 caracteres.' } })} />
            </Campo>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3">
              <Campo id="f-cns" rotulo="Cartão SUS" obrigatorio erro={errors.cartaoSus?.message}>
                <input id="f-cns" inputMode="numeric" maxLength={15} placeholder="15 dígitos" className="vv-in" aria-invalid={!!errors.cartaoSus} {...register('cartaoSus', { required: 'Informe o número do Cartão SUS.', pattern: { value: CARTAO_VALIDO, message: 'O Cartão SUS tem 15 dígitos, só números.' } })} />
              </Campo>
              <Campo id="f-nasc" rotulo="Data de nascimento" obrigatorio erro={errors.dataNascimento?.message}>
                <Controller name="dataNascimento" control={control} rules={{ required: 'Informe a data de nascimento.', validate: (v) => v < hojeIso() || 'A data de nascimento deve estar no passado.' }} render={({ field }) => <CampoData id="f-nasc" max={hojeIso()} invalido={!!errors.dataNascimento} valor={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
              </Campo>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3">
              <Campo id="f-tel" rotulo="Celular" obrigatorio erro={errors.telefone?.message}>
                <input id="f-tel" type="tel" inputMode="numeric" placeholder="11990000000" className="vv-in" aria-invalid={!!errors.telefone} {...register('telefone', { required: 'Informe o telefone do paciente.', pattern: { value: TELEFONE_VALIDO, message: 'O telefone deve ter 10 ou 11 dígitos, só números.' } })} />
              </Campo>
              <Campo id="f-bairro" rotulo={<>Bairro <span className="font-normal text-muted">(opcional)</span></>}>
                <Controller name="bairro" control={control} render={({ field }) => <Combo id="f-bairro" livre opcoes={bairros} placeholder="Digite ou escolha" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
              </Campo>
            </div>
            <div>
              <span className="vv-lbl">Canal de contato preferido</span>
              <Opcoes rotulo="Canal de contato preferido" opcoes={OPCOES_CANAL} valor={canal} onEscolher={(v) => setValue('canalContato', v)} className="grid grid-cols-3 gap-1.5" botaoClassName="min-h-[46px] rounded-xl text-[13.5px]" />
              <p className="vv-help">Sem resposta, o sistema tenta o próximo canal: WhatsApp, SMS e, por fim, ligação da recepção.</p>
            </div>
            <Campo id="f-fam" rotulo={<>Telefone de um familiar <span className="font-normal text-muted">(opcional)</span></>} ajuda="Para quem não usa celular. Só com autorização do paciente." erro={errors.telefoneFamiliar?.message}>
              <input id="f-fam" type="tel" inputMode="numeric" placeholder="11990000000" className="vv-in" aria-invalid={!!errors.telefoneFamiliar} {...register('telefoneFamiliar', { validate: (v) => v === '' || TELEFONE_VALIDO.test(v) || 'O telefone do familiar deve ter 10 ou 11 dígitos, só números.' })} />
            </Campo>
            {erroForm && <div role="alert" className="rounded-[14px] border border-danger px-3.5 py-3 text-sm">{erroForm}</div>}
            <div className="flex flex-wrap gap-2.5">
              <BotaoEnvio enviando={isSubmitting} texto={editando !== null ? 'Salvar alterações' : 'Cadastrar paciente'} textoEnviando="Salvando…" className="flex-[1_1_160px] !text-[15px]" />
              <button type="button" onClick={fechar} className="vv-ghost !min-h-[52px] !px-5 !text-[15px]">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
