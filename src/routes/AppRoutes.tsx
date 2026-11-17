import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout, PacienteLayout, SiteLayout } from '../components/Layouts'
import { ProtectedRoute } from './ProtectedRoute'

const Home = lazy(() => import('../pages/Home'))
const Integrantes = lazy(() => import('../pages/Integrantes'))
const Sobre = lazy(() => import('../pages/Sobre'))
const Faq = lazy(() => import('../pages/Faq'))
const Contato = lazy(() => import('../pages/Contato'))
const Login = lazy(() => import('../pages/Login'))
const PrimeiroAcesso = lazy(() => import('../pages/PrimeiroAcesso'))
const Agenda = lazy(() => import('../pages/Agenda'))
const NovaConsulta = lazy(() => import('../pages/NovaConsulta'))
const ConsultaDetalhe = lazy(() => import('../pages/ConsultaDetalhe'))
const Pacientes = lazy(() => import('../pages/Pacientes'))
const ListaEspera = lazy(() => import('../pages/ListaEspera'))
const Painel = lazy(() => import('../pages/Painel'))
const AdminEquipe = lazy(() => import('../pages/AdminEquipe'))
const CelularPaciente = lazy(() => import('../pages/CelularPaciente'))
const FilaPaciente = lazy(() => import('../pages/FilaPaciente'))
const NotFound = lazy(() => import('../pages/NotFound'))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/integrantes" element={<Integrantes />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/login" element={<Login />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/consultas/nova" element={<NovaConsulta />} />
        <Route path="/consultas/:id" element={<ConsultaDetalhe />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/lista-espera" element={<ListaEspera />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/admin/equipe" element={<ProtectedRoute perfil="GESTAO"><AdminEquipe /></ProtectedRoute>} />
      </Route>

      <Route element={<PacienteLayout />}>
        <Route path="/celular/:token" element={<CelularPaciente />} />
        <Route path="/fila/:token" element={<FilaPaciente />} />
      </Route>
    </Routes>
  )
}
