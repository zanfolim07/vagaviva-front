export type CategoriaFaq = 'paciente' | 'equipe' | 'ia' | 'contratacao'

export const NOMES_CATEGORIA: Record<CategoriaFaq, string> = {
  paciente: 'PACIENTES',
  equipe: 'EQUIPES DE SAÚDE',
  ia: 'INTELIGÊNCIA ARTIFICIAL',
  contratacao: 'CONTRATAÇÃO',
}

export const FILTROS_FAQ: { id: CategoriaFaq | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'paciente', label: 'Pacientes' },
  { id: 'equipe', label: 'Equipes de saúde' },
  { id: 'ia', label: 'Inteligência artificial' },
  { id: 'contratacao', label: 'Contratação' },
]

export const PERGUNTAS: { c: CategoriaFaq; p: string; r: string }[] = [
  { c: 'paciente', p: 'Preciso instalar algum aplicativo?', r: 'Não. Você recebe uma mensagem com data, horário e local da consulta e responde com um toque.' },
  { c: 'paciente', p: 'E se eu não puder ir à consulta?', r: 'Basta responder que não vai conseguir. A recepção entra em contato para remarcar e sua vaga é oferecida a outra pessoa que está esperando.' },
  { c: 'paciente', p: 'Como funciona a lista de espera?', r: 'Quando um horário é liberado, ele é oferecido a quem está na fila da mesma especialidade e unidade. A ordem soma a gravidade do problema de saúde, definida pelo profissional que fez o pedido, e o tempo de espera: quem espera há meses sobe sozinho, e casos com prazo legal vêm primeiro.' },
  { c: 'equipe', p: 'O que muda no dia a dia da recepção?', r: 'A agenda aparece em ordem de risco, com o motivo de cada um. A equipe liga primeiro para quem mais precisa, e as vagas liberadas vão sozinhas para a fila.' },
  { c: 'equipe', p: 'Quando uma vaga é liberada?', r: 'Quando o paciente avisa que não vai, pela mensagem ou por telefone. Se ele não responder, a recepção liga; sem contato até 24 horas antes, a recepção pode liberar a vaga. O sistema nunca libera uma vaga sozinho.' },
  { c: 'ia', p: 'A IA pode cancelar a consulta de alguém?', r: 'Não. A previsão só define o tipo de contato que cada paciente recebe. Nenhuma consulta é cancelada por causa de uma previsão.' },
  { c: 'ia', p: 'Como a IA calcula o risco de falta?', r: 'Ela aprendeu com 110.527 consultas reais do SUS em Vitória (ES). Fatores como antecedência do agendamento, histórico de faltas e se houve lembrete ajudam a estimar a chance de falta.' },
  { c: 'ia', p: 'E se a previsão estiver fora do ar?', r: 'A consulta é agendada normalmente, com o risco marcado como não calculado. A agenda da unidade continua funcionando.' },
  { c: 'contratacao', p: 'Quem contrata a Vaga Viva?', r: 'Secretarias municipais de saúde, por meio de uma assinatura por unidade, com implantação e suporte. Para o paciente, é gratuito.' },
  { c: 'contratacao', p: 'Como os dados dos pacientes são protegidos?', r: 'Seguimos a LGPD e guardamos apenas o necessário para agendar, confirmar e reorganizar a fila.' },
]