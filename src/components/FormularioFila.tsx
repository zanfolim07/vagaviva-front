import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { incluirNaFila } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { ClasseRisco, ClasseRiscoId, ListaEspera, Paciente, Profissional } from '../types'
import { Combo } from './Combo'
import { aplicarErrosDeCampo, BotaoEnvio, Campo } from './Formulario'

interface FormFila {
  pacienteId: string
  classeRisco: ClasseRiscoId
  prazoLegal: boolean
  justificativaClinica: string
  profissionalSolicitanteId: string
  profissionalPreferidoId: string
  prioridadeLegal: string
  aceitaMesmoDia: boolean
}

const PRIORIDADES = [
  { valor: '', rotulo: 'Nenhuma' },
  { valor: '60+', rotulo: '60 anos ou mais' },
  { valor: '80+', rotulo: '80 anos ou mais' },
  { valor: 'GESTANTE', rotulo: 'Gestante' },
  { valor: 'PCD', rotulo: 'Pessoa com deficiência' },
]

interface FormularioFilaProps {
  pacientes: Paciente[]
  profissionais: Profissional[]
  classes: ClasseRisco[]
  especialidadeId: number
  unidadeId: number
  textoBotao: string
  inicial?: Partial<FormFila>
  onSucesso: (pedido: ListaEspera) => void
}

export function FormularioFila({ pacientes, profissionais, classes, especialidadeId, unidadeId, textoBotao, inicial, onSucesso }: FormularioFilaProps) {
  const [erroForm, setErroForm] = useState('')
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<FormFila>({
    defaultValues: { pacienteId: '', classeRisco: 'P3', prazoLegal: false, justificativaClinica: '', profissionalSolicitanteId: '', profissionalPreferidoId: '', prioridadeLegal: '', aceitaMesmoDia: false, ...inicial },
  })
  const classeEscolhida = useWatch({ control, name: 'classeRisco' })

  async function incluir(d: FormFila) {
    setErroForm('')
    try {
      const criado = await incluirNaFila({
        pacienteId: Number(d.pacienteId),
        especialidadeId,
        unidadeId,
        profissionalSolicitanteId: Number(d.profissionalSolicitanteId),
        profissionalPreferidoId: d.profissionalPreferidoId ? Number(d.profissionalPreferidoId) : null,
        classeRisco: d.classeRisco,
        justificativaClinica: d.justificativaClinica.trim(),
        prazoLegal: d.classeRisco === 'P1' && d.prazoLegal,
        prioridadeLegal: d.prioridadeLegal || null,
        aceitaMesmoDia: d.aceitaMesmoDia,
      })
      onSucesso(criado)
    } catch (e) {
      if (!aplicarErrosDeCampo(e, setError)) setErroForm(mensagemDeErro(e))
    }
  }

  const opcoesProfissionais = profissionais.map((p) => ({ valor: String(p.id), rotulo: p.nome }))

  return (
    <form noValidate onSubmit={handleSubmit(incluir)} className="flex flex-col gap-4">
      <Campo id="l-pac" rotulo="Paciente" obrigatorio erro={errors.pacienteId?.message}>
        <Controller name="pacienteId" control={control} rules={{ required: 'Selecione o paciente.' }} render={({ field }) => (
          <Combo id="l-pac" placeholder="Digite ou escolha" invalido={!!errors.pacienteId} valor={field.value} onChange={field.onChange} onBlur={field.onBlur} opcoes={pacientes.map((p) => ({ valor: String(p.id), rotulo: p.nome, detalhe: `Cartão SUS ${p.cartaoSus}` }))} />
        )} />
      </Campo>

      <div>
        <span className="vv-lbl">Classe de risco do pedido<span className="text-danger-text"> *</span></span>
        <div role="group" aria-label="Classe de risco do pedido" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {classes.map((c) => {
            const ativo = c.classe === classeEscolhida
            return (
              <button key={c.classe} type="button" aria-pressed={ativo} onClick={() => { setValue('classeRisco', c.classe); if (c.classe !== 'P1') setValue('prazoLegal', false) }} className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-[13.5px] leading-[1.25] ${ativo ? 'border-inv-bg bg-inv-bg text-inv-fg' : 'border-line bg-transparent text-text'}`}>
                <span className="font-semibold">{c.classe} · {c.nome}</span>
                <span className="text-[11.5px] opacity-80">até {c.prazoDias} dias</span>
              </button>
            )
          })}
        </div>
      </div>

      {classeEscolhida === 'P1' && (
        <label htmlFor="l-legal" className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm">
          <input id="l-legal" type="checkbox" className="mt-px h-5 w-5 flex-none accent-[#ed145b]" {...register('prazoLegal')} />
          <span>Caso com prazo definido em lei (ex.: suspeita de câncer, exame em até 30 dias pela Lei 13.896/2019)</span>
        </label>
      )}

      <Campo id="l-just" rotulo="Justificativa clínica" obrigatorio erro={errors.justificativaClinica?.message}>
        <textarea id="l-just" rows={3} placeholder="Copiada do pedido do profissional" className="vv-in !text-[15px]" aria-invalid={!!errors.justificativaClinica} {...register('justificativaClinica', { validate: (v) => v.trim().length >= 20 || 'Escreva a justificativa do pedido (mínimo de 20 caracteres).' })} />
      </Campo>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        <Campo id="l-sol" rotulo="Pedido feito por" obrigatorio erro={errors.profissionalSolicitanteId?.message}>
          <Controller name="profissionalSolicitanteId" control={control} rules={{ required: 'Selecione o profissional.' }} render={({ field }) => (
            <Combo id="l-sol" placeholder="Digite ou escolha" invalido={!!errors.profissionalSolicitanteId} valor={field.value} onChange={field.onChange} onBlur={field.onBlur} opcoes={opcoesProfissionais} />
          )} />
        </Campo>
        <Campo id="l-pref" rotulo={<>Profissional preferido <span className="font-normal text-muted">(opcional)</span></>} ajuda="Com preferido, o paciente só recebe vagas desse profissional.">
          <Controller name="profissionalPreferidoId" control={control} render={({ field }) => (
            <Combo id="l-pref" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} opcoes={[{ valor: '', rotulo: 'Qualquer profissional' }, ...opcoesProfissionais]} />
          )} />
        </Campo>
      </div>

      <Campo id="l-pl" rotulo="Prioridade legal de atendimento" ajuda="Usada como desempate entre pontuações iguais." erro={errors.prioridadeLegal?.message}>
        <Controller name="prioridadeLegal" control={control} render={({ field }) => <Combo id="l-pl" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} opcoes={PRIORIDADES} />} />
      </Campo>

      <label htmlFor="l-mesmo" className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm">
        <input id="l-mesmo" type="checkbox" className="mt-px h-5 w-5 flex-none accent-[#2bd47d]" {...register('aceitaMesmoDia')} />
        <span>Aceita ser chamado para vagas do mesmo dia</span>
      </label>

      {erroForm && <div role="alert" className="vv-rise rounded-[14px] border border-danger px-3.5 py-3 text-sm">{erroForm}</div>}
      <BotaoEnvio enviando={isSubmitting} texto={textoBotao} textoEnviando="Incluindo…" className="!min-h-[50px] !text-[15px]" />
    </form>
  )
}
