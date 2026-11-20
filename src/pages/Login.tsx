import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { aplicarErrosDeCampo, BotaoEnvio, Campo } from '../components/Formulario'
import { IconeOlho } from '../components/Icones'
import { useAuth } from '../context/AuthContext'
import { mensagemDeErro } from '../services/http'
import { EMAIL_VALIDO } from '../utils/formatos'

interface FormLogin {
  email: string
  senha: string
  manterConectado: boolean
}

const VANTAGENS = ['Agenda do dia ordenada por risco de falta', 'Lista de espera com sugestão de quem chamar', 'Painel de resultados para a gestão']

export default function Login() {
  const { usuario, carregando, entrar } = useAuth()
  const navigate = useNavigate()
  const destino = (useLocation().state as { de?: string } | null)?.de
  const [verSenha, setVerSenha] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormLogin>({
    defaultValues: { email: '', senha: '', manterConectado: false },
  })

  if (!carregando && usuario && !isSubmitting) {
    return <Navigate to={destino ?? (usuario.perfil === 'GESTAO' ? '/painel' : '/agenda')} replace />
  }

  async function enviar(dados: FormLogin) {
    setErroGeral('')
    try {
      const logado = await entrar(dados.email.trim(), dados.senha, dados.manterConectado)
      navigate(destino ?? (logado.perfil === 'GESTAO' ? '/painel' : '/agenda'), { replace: true })
    } catch (e) {
      if (!aplicarErrosDeCampo(e, setError)) setErroGeral(mensagemDeErro(e))
    }
  }

  return (
    <main id="conteudo" className="mx-auto grid w-full vv-container flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-x-[72px] gap-y-12 px-4 pb-[72px] pt-14 sm:px-6">
      <section aria-labelledby="l-tit" className="flex flex-col gap-[22px]">
        <span className="vv-eyebrow">ÁREA DA EQUIPE</span>
        <h1 id="l-tit" className="m-0 text-[clamp(27.2px,3.2vw,40.6px)] font-light leading-[1.08] tracking-[-0.035em]">Entre para ver a agenda da sua unidade.</h1>
        <p className="m-0 max-w-[520px] text-[17px] text-muted">Acesso exclusivo para recepção e gestão das unidades de saúde. Pacientes não precisam de conta: eles respondem pela mensagem que recebem.</p>
        <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15.5px]">
          {VANTAGENS.map((t) => (
            <li key={t} className="flex items-start gap-3 text-left">
              <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-accent" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Formulário de acesso" className="rounded-[28px] border border-line bg-bg p-[clamp(24px,4vw,40px)]">
        <form noValidate onSubmit={handleSubmit(enviar)} className="flex flex-col gap-5">
          <div>
            <div className="text-2xl font-medium tracking-[-0.02em]">Entrar</div>
            <p className="mb-0 mt-1 text-[14.5px] text-muted">Use o e-mail institucional cadastrado pelo gestor.</p>
          </div>
          {erroGeral && <div role="alert" className="vv-rise rounded-[14px] border border-danger px-3.5 py-3 text-sm">{erroGeral}</div>}
          <Campo id="l-email" rotulo="E-mail institucional" obrigatorio erro={errors.email?.message}>
            <input id="l-email" type="email" autoComplete="username" inputMode="email" placeholder="nome@saude.sp.gov.br" className="vv-in" aria-invalid={!!errors.email} {...register('email', { validate: (v) => EMAIL_VALIDO.test(v.trim()) || 'Digite um e-mail válido.' })} />
          </Campo>
          <Campo id="l-senha" rotulo="Senha" obrigatorio erro={errors.senha?.message}>
            <div className="relative">
              <input id="l-senha" type={verSenha ? 'text' : 'password'} autoComplete="current-password" className="vv-in !pr-16" aria-invalid={!!errors.senha} {...register('senha', { required: 'Informe a senha.', minLength: { value: 8, message: 'A senha tem pelo menos 8 caracteres.' } })} />
              <button type="button" onClick={() => setVerSenha(!verSenha)} aria-pressed={verSenha} aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-[10px] text-muted">
                <IconeOlho />
              </button>
            </div>
          </Campo>
          <label htmlFor="l-lembrar" className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14.5px]">
            <input id="l-lembrar" type="checkbox" className="h-5 w-5 accent-[#2bd47d]" {...register('manterConectado')} />
            Manter conectado
          </label>
          <BotaoEnvio enviando={isSubmitting} texto="Entrar" textoEnviando="Entrando…" className="w-full" />
          <div className="border-t border-line pt-[18px] text-[14.5px] text-muted">
            Primeiro acesso? <Link to="/primeiro-acesso">Ative sua conta com o código de convite</Link>
          </div>
          <p className="m-0 text-[12.5px] text-muted">Esqueceu a senha? Fale com o gestor da sua unidade.</p>
        </form>
      </section>
    </main>
  )
}
