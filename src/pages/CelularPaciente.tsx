import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Carregando, ErroTela, Spinner } from '../components/Estados'
import { IconeCheck } from '../components/Icones'
import { CartaoSituacao, TopoPaciente } from '../components/Layouts'
import { useAsync } from '../hooks/useAsync'
import { cancelarPublica, confirmarPublica, consultaPublica } from '../services/api'
import { HttpError, mensagemDeErro } from '../services/http'
import { dataCurta, horaFalada, semanaLonga } from '../utils/formatos'

const BOTAO = 'min-h-14 rounded-[18px] text-[17px] transition-transform active:scale-[.98] disabled:opacity-60'
type Tela = 'inicio' | 'pergunta' | 'confirmado' | 'cancelado'

export default function CelularPaciente() {
  const { token = '' } = useParams()
  const [tela, setTela] = useState<Tela>('inicio')
  const [enviando, setEnviando] = useState(false)
  const [erroAcao, setErroAcao] = useState('')
  const { dados: c, erro, carregando, recarregar } = useAsync(() => consultaPublica(token), [token])

  async function responder(acao: () => Promise<unknown>, destino: Tela) {
    setEnviando(true)
    setErroAcao('')
    try {
      await acao()
      setTela(destino)
    } catch (e) {
      setErroAcao(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <><TopoPaciente /><div className="mt-9"><Carregando texto="Buscando sua consulta…" linhas={2} altura="h-40" /></div></>
  if (erro instanceof HttpError && erro.status === 404) {
    return (
      <>
        <TopoPaciente />
        <CartaoSituacao circulo={null}>
          <div className="text-[23.8px] font-light tracking-[-0.03em]">Link inválido ou expirado</div>
          <div className="max-w-[300px] text-base text-muted">Peça um novo link à sua unidade de saúde.</div>
        </CartaoSituacao>
      </>
    )
  }
  if (erro !== null || !c) return <><TopoPaciente /><div className="mt-9"><ErroTela titulo="Não foi possível carregar sua consulta." erro={erro} onTentar={recarregar} /></div></>

  const dia = semanaLonga(c.dataConsulta).replace('-feira', '')
  const quando = `${dia}, ${dataCurta(c.dataConsulta)}, às ${horaFalada(c.dataConsulta)}`
  const podeResponder = c.status === 'AGENDADA' || c.status === 'CONFIRMADA'

  return (
    <>
      <TopoPaciente unidade={c.unidade} />

      {tela === 'inicio' && (
        <div className="vv-rise mt-9 flex flex-1 flex-col gap-5">
          <div>
            <div className="text-[25.5px] font-light leading-[1.15] tracking-[-0.03em]">Olá, {c.primeiroNome}.</div>
            <div className="mt-1.5 text-base text-muted">{podeResponder ? 'Você tem uma consulta marcada.' : 'Esta consulta já foi encerrada.'}</div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="border-b border-line px-5 pb-[18px] pt-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-accent-text">{semanaLonga(c.dataConsulta)}</div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span className="text-[35.7px] font-light leading-none tracking-[-0.03em]">{dataCurta(c.dataConsulta)}</span>
                <span className="text-[22px] font-light text-muted">{horaFalada(c.dataConsulta)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4 text-[15px]">
              <div>{c.especialidade} · {c.profissional}</div>
              <div className="text-muted">{c.unidade} · {c.endereco}</div>
            </div>
          </div>
          <div className="flex-1" />
          {erroAcao && <p role="alert" className="vv-err !mt-0 text-center">{erroAcao}</p>}
          {podeResponder ? (
            <>
              {c.status === 'AGENDADA' ? (
                <>
                  <div className="text-center text-[15.5px] font-medium">Você consegue ir?</div>
                  <button type="button" disabled={enviando} onClick={() => responder(() => confirmarPublica(token), 'confirmado')} className={`${BOTAO} flex items-center justify-center gap-2.5 bg-accent font-semibold text-on-accent`}>{enviando && <Spinner escuro />}Sim, vou à consulta</button>
                </>
              ) : (
                <div className="text-center text-[15.5px] font-medium text-accent-text">Sua presença está confirmada.</div>
              )}
              <button type="button" onClick={() => setTela('pergunta')} className={`${BOTAO} border border-line text-text`}>Não vou conseguir</button>
            </>
          ) : (
            <div className="text-center text-sm text-muted">Precisa de algo? Fale com a sua unidade.</div>
          )}
        </div>
      )}

      {tela === 'pergunta' && (
        <div className="vv-rise mt-9 flex flex-1 flex-col gap-[18px]">
          <div className="text-[23.8px] font-light leading-[1.2] tracking-[-0.03em]">Quer mesmo desmarcar a consulta de {dia}?</div>
          <div className="text-base text-muted">Seu horário vai para outra pessoa que está esperando. A recepção liga para você para marcar uma nova data.</div>
          <div className="flex-1" />
          {erroAcao && <p role="alert" className="vv-err !mt-0 text-center">{erroAcao}</p>}
          <button type="button" disabled={enviando} onClick={() => responder(() => cancelarPublica(token), 'cancelado')} className={`${BOTAO} flex items-center justify-center gap-2.5 bg-inv-bg font-semibold text-inv-fg`}>{enviando && <Spinner />}Sim, desmarcar</button>
          <button type="button" onClick={() => setTela('inicio')} className={`${BOTAO} border border-line text-text`}>Voltar</button>
        </div>
      )}

      {tela === 'confirmado' && (
        <CartaoSituacao circulo={<span className="vv-pop flex h-[88px] w-[88px] items-center justify-center rounded-full bg-accent text-[#0b0b0b]"><IconeCheck tamanho={38} /></span>}>
          <div className="vv-rise text-[23.8px] font-light tracking-[-0.03em]">Presença confirmada</div>
          <div className="vv-rise max-w-[300px] text-base text-muted">Te esperamos {quando}. Você recebe um lembrete na véspera.</div>
        </CartaoSituacao>
      )}

      {tela === 'cancelado' && (
        <CartaoSituacao circulo={<span className="vv-pop flex h-[88px] w-[88px] items-center justify-center rounded-full border-[1.5px] border-accent-text text-accent-text"><svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg></span>}>
          <div className="vv-rise text-[23.8px] font-light tracking-[-0.03em]">Obrigado por avisar, {c.primeiroNome}</div>
          <div className="vv-rise max-w-[300px] text-base text-muted">Seu horário vai para outra pessoa da fila. A recepção vai te ligar para remarcar.</div>
        </CartaoSituacao>
      )}

      <div className="mt-4 text-center text-xs text-muted">Dúvidas? Ligue para a {c.unidade}.</div>
    </>
  )
}
