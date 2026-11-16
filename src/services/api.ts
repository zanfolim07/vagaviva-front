import { http } from './http'
import type {
  ExplicacaoRisco, AcaoConsulta,
  ClasseRisco,
  Consulta,
  ConsultaPublica,
  ConsultaRequest,
  Convite,
  Especialidade,
  FilaPublica,
  ListaEspera,
  ListaEsperaRequest,
  LoginResponse,
  Paciente,
  PacienteRequest,
  Painel,
  Profissional,
  Recusa,
  StatusConsulta,
  StatusEspera,
  Unidade,
  Usuario,
  UsuarioRequest,
} from '../types'

type Parametros = Record<string, string | number | null | undefined>

function query(parametros: Parametros) {
  const busca = new URLSearchParams()
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') busca.set(chave, String(valor))
  })
  const texto = busca.toString()
  return texto ? `?${texto}` : ''
}

const json = (corpo: unknown) => JSON.stringify(corpo)

export const login = (email: string, senha: string, manterConectado: boolean) =>
  http<LoginResponse>('/auth/login', { method: 'POST', body: json({ email, senha, manterConectado }) })
export const consultarConvite = (codigo: string) => http<Convite>(`/auth/convite/${encodeURIComponent(codigo)}`)
export const ativarConta = (codigoConvite: string, nome: string, senha: string) =>
  http<Usuario>('/auth/ativar', { method: 'POST', body: json({ codigoConvite, nome, senha }) })
export const buscarMe = () => http<Usuario>('/auth/me')
export const logout = () => http<void>('/auth/logout', { method: 'POST' })

export const listarUsuarios = () => http<Usuario[]>('/usuarios')
export const criarUsuario = (dados: UsuarioRequest) => http<Usuario>('/usuarios', { method: 'POST', body: json(dados) })
export const reenviarConvite = (id: number) => http<Usuario>(`/usuarios/${id}/convite`, { method: 'PATCH' })
export const desativarUsuario = (id: number) => http<Usuario>(`/usuarios/${id}/desativar`, { method: 'PATCH' })
export const reativarUsuario = (id: number) => http<Usuario>(`/usuarios/${id}/reativar`, { method: 'PATCH' })

export const listarUnidades = () => http<Unidade[]>('/unidades')
export const listarEspecialidades = () => http<Especialidade[]>('/especialidades')
export const listarProfissionais = (filtros: { unidade?: number | null; especialidade?: number | null } = {}) =>
  http<Profissional[]>(`/profissionais${query(filtros)}`)
export const horariosLivres = (profissionalId: number, data: string) =>
  http<string[]>(`/profissionais/${profissionalId}/horarios-livres${query({ data })}`)

export const listarPacientes = (filtros: { busca?: string; cartaoSus?: string } = {}) =>
  http<Paciente[]>(`/pacientes${query(filtros)}`)
export const buscarPaciente = (id: number) => http<Paciente>(`/pacientes/${id}`)
export const criarPaciente = (dados: PacienteRequest) => http<Paciente>('/pacientes', { method: 'POST', body: json(dados) })
export const atualizarPaciente = (id: number, dados: PacienteRequest) =>
  http<Paciente>(`/pacientes/${id}`, { method: 'PUT', body: json(dados) })
export const removerPaciente = (id: number) => http<void>(`/pacientes/${id}`, { method: 'DELETE' })
export const consultasDoPaciente = (id: number) => http<Consulta[]>(`/pacientes/${id}/consultas`)
export const agendarConsulta = (pacienteId: number, dados: ConsultaRequest) =>
  http<Consulta>(`/pacientes/${pacienteId}/consultas`, { method: 'POST', body: json(dados) })

export const listarConsultas = (filtros: { data?: string; unidade?: number | null; profissional?: number | null; status?: StatusConsulta }) =>
  http<Consulta[]>(`/consultas${query(filtros)}`)
export const buscarConsulta = (id: number) => http<Consulta>(`/consultas/${id}`)
export const explicarRisco = (id: number) => http<ExplicacaoRisco>(`/consultas/${id}/risco/explicacao`)
export const confirmarConsulta = (id: number) => http<Consulta>(`/consultas/${id}/confirmar`, { method: 'PATCH' })
export const cancelarConsulta = (id: number) => http<AcaoConsulta>(`/consultas/${id}/cancelar`, { method: 'PATCH' })
export const liberarConsulta = (id: number) => http<AcaoConsulta>(`/consultas/${id}/liberar`, { method: 'PATCH' })
export const registrarPresenca = (id: number, compareceu: boolean) =>
  http<Consulta>(`/consultas/${id}/presenca`, { method: 'PATCH', body: json({ compareceu }) })

export const listarFila = (filtros: { especialidade?: number | null; unidade?: number | null; paciente?: number | null; status?: StatusEspera }) =>
  http<ListaEspera[]>(`/lista-espera${query(filtros)}`)
export const listarClasses = () => http<ClasseRisco[]>('/lista-espera/classes')
export const incluirNaFila = (dados: ListaEsperaRequest) =>
  http<ListaEspera>('/lista-espera', { method: 'POST', body: json(dados) })
export const removerDaFila = (id: number) => http<void>(`/lista-espera/${id}`, { method: 'DELETE' })
export const aceitarOferta = (id: number) => http<Consulta>(`/lista-espera/${id}/aceitar`, { method: 'PATCH' })
export const recusarOferta = (id: number) => http<Recusa>(`/lista-espera/${id}/recusar`, { method: 'PATCH' })

export const buscarPainel = (unidade: number | null) => http<Painel>(`/painel${query({ unidade })}`)
export const buscarPainelPublico = () => http<Painel>('/publico/painel')

export const consultaPublica = (token: string) => http<ConsultaPublica>(`/publico/consultas/${token}`)
export const confirmarPublica = (token: string) =>
  http<ConsultaPublica>(`/publico/consultas/${token}/confirmar`, { method: 'PATCH' })
export const cancelarPublica = (token: string) =>
  http<ConsultaPublica>(`/publico/consultas/${token}/cancelar`, { method: 'PATCH' })
export const filaPublica = (token: string) => http<FilaPublica>(`/publico/fila/${token}`)
export const aceitarFila = (token: string) => http<FilaPublica>(`/publico/fila/${token}/aceitar`, { method: 'PATCH' })
export const recusarFila = (token: string) => http<FilaPublica>(`/publico/fila/${token}/recusar`, { method: 'PATCH' })
export const sairDaFila = (token: string) => http<FilaPublica>(`/publico/fila/${token}/sair`, { method: 'PATCH' })
export const mesmoDiaFila = (token: string, aceita: boolean) =>
  http<FilaPublica>(`/publico/fila/${token}/mesmo-dia`, { method: 'PATCH', body: json({ aceita }) })
