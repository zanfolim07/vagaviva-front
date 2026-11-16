import type { OpcaoCombo } from '../components/Combo'

const NOMES = [
  'São Paulo (SP)', 'Guarulhos (SP)', 'Campinas (SP)', 'São Bernardo do Campo (SP)', 'Santo André (SP)', 'Osasco (SP)',
  'São José dos Campos (SP)', 'Ribeirão Preto (SP)', 'Sorocaba (SP)', 'Mauá (SP)', 'São José do Rio Preto (SP)', 'Santos (SP)',
  'Mogi das Cruzes (SP)', 'Diadema (SP)', 'Jundiaí (SP)', 'Carapicuíba (SP)', 'Piracicaba (SP)', 'Bauru (SP)',
  'Itaquaquecetuba (SP)', 'São Vicente (SP)', 'Franca (SP)', 'Praia Grande (SP)', 'Guarujá (SP)', 'Taubaté (SP)',
  'Limeira (SP)', 'Suzano (SP)', 'Taboão da Serra (SP)', 'Sumaré (SP)', 'Barueri (SP)', 'Embu das Artes (SP)',
  'Rio de Janeiro (RJ)', 'Belo Horizonte (MG)', 'Vitória (ES)', 'Curitiba (PR)', 'Porto Alegre (RS)', 'Florianópolis (SC)',
  'Salvador (BA)', 'Recife (PE)', 'Fortaleza (CE)', 'Brasília (DF)', 'Goiânia (GO)', 'Manaus (AM)', 'Belém (PA)',
]

export const MUNICIPIOS: OpcaoCombo[] = NOMES.map((n) => ({ valor: n, rotulo: n }))