import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SidebarLayout from './components/layout/SidebarLayout'
import RutaProtegida from './components/routing/RutaProtegida'
import Login from './views/Login'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import Ejercicios from './views/Ejercicios'
import Entrenados from './views/Entrenados'

const RutaPublica = ({ children }: { children: ReactNode }): ReactNode => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App(): ReactNode {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
          <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />

          <Route element={<RutaProtegida><SidebarLayout /></RutaProtegida>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ejercicios" element={<Ejercicios />} />
            <Route path="/entrenados" element={<Entrenados />} />
            <Route path="/entrenados/:atletaId" element={<div className="p-8 text-gray-500">Perfil completo (próximamente)</div>} />
            <Route path="/calendario" element={<div className="p-8 text-gray-500">Calendario (próximamente)</div>} />
            <Route path="/plantillas" element={<div className="p-8 text-gray-500">Plantillas (próximamente)</div>} />
            <Route path="/asignaciones" element={<div className="p-8 text-gray-500">Asignaciones (próximamente)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
