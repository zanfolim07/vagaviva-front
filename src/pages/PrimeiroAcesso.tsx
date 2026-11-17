import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { aplicarErrosDeCampo, BotaoEnvio, Campo } from '../components/Formulario'
import { Spinner } from '../components/Estados'
import { IconeCheck, IconeOlho } from '../components/Icones'
import { consultarConvite, ativarConta } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { Convite } from '../types'
import { dataCompleta } from '../utils/formatos'

interface FormAtivar {
  nome: string
  senha: string
  confirmacao: string
  termo: boolean
}

const PASSOS = ['O gestor cadastra seu nome, e-mail e perfil.', 'Ele passa para você o código de convite, que tem prazo de validade.', 'Você cria a senha aqui e entra no sistema.']

export default function PrimeiroAcesso() {
  const [codigo, setCodigo] = useState('')
  const [validando, setValidando] = useState(false)
  const [erroCodigo, setErroCodigo] = useState('')
  const [convite, setConvite] = useState<Convite | null>(null)
  const [verSenha, setVerSenha] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  const [ativadoNome, setAtivadoNome] = useState('')
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<FormAtivar>({
    defaultValues: { nome: '', senha: '', confirmacao: '', termo: false },
  })
  const senha = useWatch({ control, name: 'senha' })
  const codigoNormal = codigo.trim().toUpperCase()
  const perfilNome = convite?.perfil === 'GESTAO' ? 'Gestão' : 'Recepção'

  async function validar() {
    setConvite(null)
    if (!/^VV-\d{4}$/.test(codigoNormal)) {
      setErroCodigo('O código tem o formato VV-0000.')
      return
    }
    setErroCodigo('')
    setValidando(true)
    try {
      const dados = await consultarConvite(codigoNormal)
      setConvite(dados)
      setValue('nome', dados.nome)
    } catch (e) {
      setErroCodigo(mensagemDeErro(e))
    } finally {
      setValidando(false)
    }
  }

  async function ativar(dados: FormAtivar) {
    setErroGeral('')
    try {
      const usuario = await ativarConta(codigoNormal, dados.nome.trim(), dados.senha)
      setAtivadoNome(usuario.nome)
    } catch (e) {
      if (!aplicarErrosDeCampo(e, setError)) setErroGeral(mensagemDeErro(e))
    }
  }

  const requisitos = [
    { ok: senha.length >= 8, texto: 'Pelo menos 8 caracteres' },
    { ok: /\d/.test(senha), texto: 'Pelo menos um número' },
    { ok: /[A-Z]/.test(senha), texto: 'Pelo menos uma letra maiúscula' },
  ]

  return (
    <main id="conteudo" className="mx-auto grid w-full vv-container flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-x-[72px] gap-y-12 px-4 pb-[72px] pt-14 sm:px-6">
      <section aria-labelledby="c-tit" className="flex flex-col gap-[22px]">
        <span className="vv-eyebrow">PRIMEIRO ACESSO</span>
        <h1 id="c-tit" className="m-0 text-[clamp(27.2px,3.2vw,40.6px)] font-light leading-[1.08] tracking-[-0.035em]">Ative sua conta da equipe.</h1>
        <p className="m-0 max-w-[520px] text-[17px] text-muted">O gestor da sua unidade cadastra você na Vaga Viva e passa um código de convite. Com ele, você cria sua senha e já pode entrar.</p>
        <ol className="m-0 flex list-none flex-col gap-3.5 p-0 text-[15.5px]">
          {PASSOS.map((t, i) => (
            <li key={t} className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3 text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[13px] text-accent-text">{i + 1}</span>
              <span className="pt-1">{t}</span>
            </li>
          ))}
        </ol>
        <p className="m-0 text-sm text-muted">Não recebeu o código? Fale com o gestor da sua unidade. Por segurança, ninguém consegue criar uma conta sem convite.</p>
      </section>

      <section aria-label="Formulário de primeiro acesso" className="rounded-[28px] border border-line bg-bg p-[clamp(24px,4vw,40px)]">
        {ativadoNome ? (
          <div role="status" className="vv-rise flex flex-col gap-[18px]">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={24} /></span>
            <div>
              <div className="text-2xl font-medium tracking-[-0.02em]">Conta ativada</div>
              <p className="mb-0 mt-1 text-[14.5px] text-muted">{ativadoNome}, sua conta de {perfilNome} na {convite?.unidade.nome} está pronta. Entre com seu e-mail e a senha que você criou.</p>
            </div>
            <Link to="/login" className="vv-primary w-full">Ir para o login</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="c-cod" className="vv-lbl">Código de convite<span className="text-danger-text"> *</span></label>
              <div className="flex gap-2">
                <input id="c-cod" className="vv-in" autoComplete="one-time-code" placeholder="VV-0000" value={codigo} aria-invalid={!!erroCodigo} onChange={(e) => { setCodigo(e.target.value); setErroCodigo(''); setConvite(null) }} />
                <button type="button" onClick={validar} disabled={validando} className="vv-ghost !min-h-[52px] flex-none">
                  {validando && <Spinner />}
                  Validar
                </button>
              </div>
              {erroCodigo && <p role="alert" className="vv-err">{erroCodigo}</p>}
              {convite && (
                <div role="status" className="vv-rise mt-2.5 flex flex-wrap gap-2 text-[13.5px]">
                  <span className="rounded-full border border-accent-deep px-3 py-1 text-accent-text">Convite válido até {dataCompleta(convite.expiracaoConvite)}</span>
                  <span className="rounded-full border border-line px-3 py-1">{convite.unidade.nome}</span>
                  <span className="rounded-full border border-line px-3 py-1">Perfil {perfilNome}</span>
                </div>
              )}
            </div>

            {convite && (
              <form noValidate onSubmit={handleSubmit(ativar)} className="vv-rise flex flex-col gap-5">
                {erroGeral && <div role="alert" className="rounded-[14px] border border-danger px-3.5 py-3 text-sm">{erroGeral}</div>}
                <Campo id="c-nome" rotulo="Nome completo" obrigatorio erro={errors.nome?.message}>
                  <input id="c-nome" className="vv-in" autoComplete="name" aria-invalid={!!errors.nome} {...register('nome', { validate: (v) => v.trim().split(/\s+/).length >= 2 || 'Digite nome e sobrenome.' })} />
                </Campo>
                <Campo id="c-email" rotulo="E-mail institucional" ajuda="Definido pelo gestor no convite. Para trocar, peça a ele.">
                  <input id="c-email" type="email" className="vv-in !text-muted" value={convite.email} readOnly />
                </Campo>
                <div>
                  <label htmlFor="c-senha" className="vv-lbl">Crie uma senha<span className="text-danger-text"> *</span></label>
                  <div className="relative">
                    <input id="c-senha" type={verSenha ? 'text' : 'password'} autoComplete="new-password" className="vv-in !pr-16" aria-invalid={!!errors.senha} aria-describedby="c-req" {...register('senha', { validate: (v) => (v.length >= 8 && /\d/.test(v) && /[A-Z]/.test(v)) || 'A senha ainda não atende aos requisitos.' })} />
                    <button type="button" onClick={() => setVerSenha(!verSenha)} aria-pressed={verSenha} aria-label={verSenha ? 'Ocultar senhas' : 'Mostrar senhas'} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-[10px] text-muted"><IconeOlho /></button>
                  </div>
                  <ul id="c-req" className="m-0 mt-2.5 flex list-none flex-col gap-1 p-0 text-[13.5px]">
                    {requisitos.map((r) => (
                      <li key={r.texto} className={`flex items-center gap-2 text-left ${r.ok ? 'text-accent-text' : 'text-muted'}`}>
                        <span aria-hidden="true" className="w-4 text-center">{r.ok ? '✓' : '·'}</span>
                        {r.texto}
                        <span className="sr-only">{r.ok ? ' (atendido)' : ' (pendente)'}</span>
                      </li>
                    ))}
                  </ul>
                  {errors.senha && <p className="vv-err">{errors.senha.message}</p>}
                </div>
                <Campo id="c-conf" rotulo="Confirme a senha" obrigatorio erro={errors.confirmacao?.message}>
                  <input id="c-conf" type={verSenha ? 'text' : 'password'} autoComplete="new-password" className="vv-in" aria-invalid={!!errors.confirmacao} {...register('confirmacao', { validate: (v, f) => (v !== '' && v === f.senha) || 'As senhas não são iguais.' })} />
                </Campo>
                <div>
                  <label htmlFor="c-termo" className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[14.5px]">
                    <input id="c-termo" type="checkbox" className="mt-0.5 h-5 w-5 flex-none accent-[#2bd47d]" aria-invalid={!!errors.termo} {...register('termo', { validate: (v) => v || 'É preciso aceitar o termo para ativar a conta.' })} />
                    <span>Li e aceito o termo de uso e de confidencialidade. Sei que os dados dos pacientes só podem ser usados para o atendimento, conforme a LGPD.</span>
                  </label>
                  {errors.termo && <p className="vv-err">{errors.termo.message}</p>}
                </div>
                <BotaoEnvio enviando={isSubmitting} texto="Ativar conta" textoEnviando="Ativando…" className="w-full" />
              </form>
            )}

            <div className="border-t border-line pt-[18px] text-[14.5px] text-muted">Já tem conta? <Link to="/login">Entrar</Link></div>
          </div>
        )}
      </section>
    </main>
  )
}
