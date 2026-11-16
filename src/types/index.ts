export interface ErroCampo {
  campo: string
  mensagem: string
}

export interface ErroApi {
  status: number
  erro: string
  mensagem: string
  caminho: string
  timestamp: string
  campos: ErroCampo[]
}

export interface Resumo {
  id: number
  nome: string
}

export interface Unidade extends Resumo {
  endereco: string
  bairro: string
  cidade: string
  telefone: string | null
}

export type Especialidade = Resumo

export interface Profissional extends Resumo {
  registro: string
  categoria: 'MEDICO' | 'ENFERMEIRO'
  unidade: Resumo
  especialidades: Especialidade[]
}

export type CanalContato = 'WHATSAPP' | 'SMS' | 'LIGACAO'

export interface Paciente extends Resumo {
  cartaoSus: string
  dataNascimento: string
  primeiraConsulta: boolean
  telefone: string
  bairro: string | null
  canalContato: CanalContato
  telefoneFamiliar: string | null
  proximaConsulta: string | null
  proximaConsultaId: number | null
}

export interface PacienteRequest {
  nome: string
  cartaoSus: string
  dataNascimento: string
  telefone: string
  bairro: string | null
  canalContato: CanalContato
  telefoneFamiliar: string | null
}

export type NivelRisco = 'ALTO' | 'MEDIO' | 'BAIXO' | 'NAO_CALCULADO'

export interface Risco {
  valor: number | null
  nivel: NivelRisco
  motivos: string[]
}

export interface FatorRisco {
  fator: string
  valor: string
  efeito: number | null
  comparacao: string
}

export interface ExplicacaoRisco {
  calculada: boolean
  fatores: FatorRisco[]
}

export type StatusConsulta = 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'FALTA' | 'CANCELADA' | 'LIBERADA'

export interface Consulta {
  id: number
  tokenPaciente: string
  paciente: Resumo & { canalContato: CanalContato | null; primeiraConsulta: boolean }
  profissional: Resumo & { especialidade: string | null }
  unidade: Resumo
  dataAgendamento: string
  dataConsulta: string
  status: StatusConsulta
  enviarLembrete: boolean
  risco: Risco
  acaoSugerida: string
}

export interface ConsultaRequest {
  profissionalId: number
  especialidadeId?: number
  dataConsulta: string
  lembrete: boolean
}

export interface Oferta {
  esperaId: number
  paciente: Resumo
  classeRisco: string
  prazoLegal: boolean
  pontuacao: number
  consultaId: number
  dataConsulta: string
  respondaAte: string | null
}

export interface AcaoConsulta {
  consulta: Consulta
  oferta: Oferta | null
}

export type StatusEspera = 'AGUARDANDO' | 'OFERTADA' | 'ATENDIDA' | 'DESISTIU'
export type ClasseRiscoId = 'P1' | 'P2' | 'P3' | 'P4'

export interface ListaEspera {
  id: number
  tokenPaciente: string
  posicao: number | null
  paciente: Resumo
  especialidade: Especialidade
  unidade: Resumo
  solicitante: Resumo & { categoria: string }
  profissionalPreferido: (Resumo & { categoria: string }) | null
  dataEntrada: string
  diasEspera: number
  prazoDias: number
  dataLimite: string
  prazoVencido: boolean
  pontuacao: number
  classeRisco: ClasseRiscoId
  prazoLegal: boolean
  prioridadeLegal: string | null
  aceitaMesmoDia: boolean
  status: StatusEspera
  consultaOfertadaId: number | null
  dataConsultaOfertada: string | null
  respondaAte: string | null
  justificativaClinica?: string
}

export interface ListaEsperaRequest {
  pacienteId: number
  especialidadeId: number
  unidadeId: number
  profissionalSolicitanteId: number
  profissionalPreferidoId: number | null
  classeRisco: ClasseRiscoId
  justificativaClinica: string
  prazoLegal: boolean
  prioridadeLegal: string | null
  aceitaMesmoDia: boolean
}

export interface Recusa {
  espera: ListaEspera
  novaOferta: Oferta | null
}

export interface ClasseRisco {
  classe: ClasseRiscoId
  nome: string
  prazoDias: number
  peso: number
}

export interface Painel {
  unidadeId: number | null
  consultas: number
  faltas: number
  taxaFalta: number
  vagasDevolvidas: number
  vagasRecuperadas: number
  valorPorConsulta: number
  valorPreservado: number
  pacientesNaFila: number
  ofertasAbertas: number
  prazosVencidos: number
  consultasHoje: number
  riscoAltoHoje: number
  porSemana: { semana: number; recuperadas: number }[]
  porEspecialidade: { especialidade: string; taxaFalta: number }[]
}

export type Perfil = 'RECEPCAO' | 'GESTAO'
export type StatusUsuario = 'PENDENTE' | 'ATIVO' | 'DESATIVADO'

export interface Usuario extends Resumo {
  email: string
  perfil: Perfil
  status: StatusUsuario
  unidade: Resumo
  codigoConvite: string | null
  expiracaoConvite: string | null
  ultimoAcesso: string | null
}

export interface UsuarioRequest {
  nome: string
  email: string
  perfil: Perfil
  unidadeId: number
}

export interface LoginResponse {
  token: string
  expiraEm: string
  usuario: Usuario
}

export interface Convite {
  nome: string
  email: string
  perfil: Perfil
  unidade: Resumo
  expiracaoConvite: string
}

export interface ConsultaPublica {
  primeiroNome: string
  dataConsulta: string
  profissional: string
  especialidade: string
  unidade: string
  endereco: string
  status: StatusConsulta
}

export type EtapaFila = 'NA_FILA' | 'VAGA_OFERECIDA' | 'CONSULTA_MARCADA' | 'SAIU_DA_FILA'

export interface FilaPublica {
  primeiroNome: string
  especialidade: string
  unidade: string
  posicao: number | null
  totalNaFila: number
  variacaoSemana: number
  diasEspera: number
  prazoAte: string
  percentualPrazo: number
  etapaAtual: EtapaFila
  aceitaMesmoDia: boolean
  oferta: {
    dataConsulta: string
    respondaAte: string | null
    profissional: string | null
    unidade: string
  } | null
}