import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { Combo } from '../components/Combo'
import { Campo, Opcoes } from '../components/Formulario'
import { IconeCheck } from '../components/Icones'
import { MUNICIPIOS } from '../data/municipios'
import { EMAIL_VALIDO } from '../utils/formatos'

type PerfilContato = 'secretaria' | 'ubs' | 'paciente'

interface FormContato {
  nome: string
  email: string
  municipio: string
  mensagem: string
}

const PASSOS = [
  ['01', 'Você envia o formulário', 'Leva menos de um minuto.'],
  ['02', 'Marcamos uma conversa', 'Entendemos a rotina das suas unidades.'],
  ['03', 'Mostramos o retorno', 'Simulamos vagas recuperadas e valor preservado.'],
]

const PERFIS: { id: PerfilContato; label: string }[] = [
  { id: 'secretaria', label: 'Secretaria de Saúde' },
  { id: 'ubs', label: 'Equipe de UBS' },
  { id: 'paciente', label: 'Paciente' },
]

export default function Contato() {
  const preenchido = (useLocation().state ?? {}) as Partial<FormContato>
  const [perfil, setPerfil] = useState<PerfilContato>('secretaria')
  const [validado, setValidado] = useState<FormContato | null>(null)
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormContato>({
    defaultValues: { nome: preenchido.nome ?? '', email: preenchido.email ?? '', municipio: preenchido.municipio ?? '', mensagem: '' },
  })
  const tamanho = useWatch({ control, name: 'mensagem' }).length

  return (
    <main id="conteudo" className="relative flex-1 overflow-hidden">
      <div className="vv-dots absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid vv-container grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-x-[72px] gap-y-12 px-4 pb-28 pt-24 sm:px-8">
        <div className="flex flex-col gap-7">
          <span className="vv-eyebrow">CONTATO</span>
          <h1 className="m-0 text-[clamp(35.2px,4.2vw,56.2px)] font-light leading-[1.02] tracking-[-0.04em]">Vamos devolver vagas à sua rede de saúde.</h1>
          <p className="m-0 text-[19px] text-muted">Conte um pouco sobre você. Respondemos para combinar uma demonstração com a agenda real da sua unidade.</p>
          <div className="mt-2 flex flex-col border-t border-line">
            {PASSOS.map(([n, t, d]) => (
              <div key={n} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3.5 border-b border-line py-5">
                <span className="tabular-nums text-accent-text">{n}</span>
                <div>
                  <div className="text-[17px] font-medium">{t}</div>
                  <div className="text-[15px] text-muted">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-bg p-6 shadow-[0_40px_100px_-50px_rgba(158,247,200,.4)] sm:p-9">
          {validado ? (
            <div role="status" className="vv-rise flex flex-col items-center gap-4 px-2 py-10 text-center">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={30} /></span>
              <div className="text-[22px] font-medium">Tudo certo com os dados, {validado.nome.trim().split(' ')[0]}!</div>
              <p className="m-0 max-w-[380px] text-center text-base text-muted">Esta versão de demonstração ainda não grava nem envia mensagens de contato, então nada foi registrado. Para falar com a equipe, use os dados do repositório do projeto.</p>
              <button type="button" onClick={() => { reset({ nome: '', email: '', municipio: '', mensagem: '' }); setValidado(null) }} className="vv-ghost">Preencher de novo</button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit(setValidado)} className="flex flex-col gap-5">
              <div className="text-[22px] font-medium">Fale com a equipe</div>
              <div>
                <span className="mb-2.5 block text-sm font-medium">Você é</span>
                <Opcoes rotulo="Você é" opcoes={PERFIS} valor={perfil} onEscolher={setPerfil} botaoClassName="min-h-11 rounded-full px-4 text-sm" className="flex flex-wrap gap-2" />
              </div>
              <Campo id="c-nome" rotulo="Nome completo" obrigatorio erro={errors.nome?.message}>
                <input id="c-nome" className="vv-in" autoComplete="name" placeholder="Como podemos te chamar" aria-invalid={!!errors.nome} {...register('nome', { validate: (v) => v.trim().length > 1 || 'Informe seu nome.' })} />
              </Campo>
              <Campo id="c-mail" rotulo="E-mail" obrigatorio erro={errors.email?.message}>
                <input id="c-mail" type="email" className="vv-in" autoComplete="email" placeholder="nome@prefeitura.gov.br" aria-invalid={!!errors.email} {...register('email', { validate: (v) => EMAIL_VALIDO.test(v.trim()) || 'Digite um e-mail válido, como nome@prefeitura.gov.br.' })} />
              </Campo>
              <Campo id="c-mun" rotulo={<>Município <span className="font-normal text-muted">(opcional)</span></>}>
                <Controller name="municipio" control={control} render={({ field }) => <Combo id="c-mun" livre opcoes={MUNICIPIOS} placeholder="Digite ou escolha" valor={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
              </Campo>
              <div>
                <label htmlFor="c-msg" className="vv-lbl">Mensagem<span className="text-danger-text"> *</span></label>
                <textarea id="c-msg" rows={4} maxLength={500} className="vv-in" placeholder="Conte quantas unidades você tem ou o que quer saber" aria-invalid={!!errors.mensagem} {...register('mensagem', { validate: (v) => v.trim().length >= 10 || 'Escreva pelo menos 10 caracteres.' })} />
                <div className="mt-2 flex justify-between gap-3">
                  {errors.mensagem && <span className="text-[13.5px] text-danger-text">{errors.mensagem.message}</span>}
                  <span className="ml-auto text-xs tabular-nums text-muted">{tamanho}/500</span>
                </div>
              </div>
              <button type="submit" className="vv-primary !min-h-14 !text-base">Enviar mensagem</button>
              <p className="m-0 text-[13px] text-muted">Usamos seus dados só para responder a este contato.</p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}