import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SidebarLayout from './components/layout/SidebarLayout'
import RutaProtegida from './components/routing/RutaProtegida'
import RutaRol from './components/routing/RutaRol'
import Login from './views/Login'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import Ejercicios from './views/Ejercicios'
import Entrenados from './views/Entrenados'
import PerfilEntrenado from './views/PerfilEntrenado'
import RutinaDetalle from './views/RutinaDetalle'
import MisRutinas from './views/MisRutinas'
import Historico from './views/Historico'
import Estadisticas from './views/Estadisticas'

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
            <Route path="/ejercicios" element={<RutaRol roles={['ENTRENADOR']}><Ejercicios /></RutaRol>} />
            <Route path="/entrenados" element={<RutaRol roles={['ENTRENADOR']}><Entrenados /></RutaRol>} />
            <Route path="/entrenados/:atletaId" element={<RutaRol roles={['ENTRENADOR']}><PerfilEntrenado /></RutaRol>} />
            <Route path="/entrenamientos/:id" element={<RutinaDetalle />} />
            <Route path="/mis-rutinas" element={<RutaRol roles={['ATLETA']}><MisRutinas /></RutaRol>} />
            <Route path="/historico" element={<RutaRol roles={['ATLETA']}><Historico /></RutaRol>} />
            <Route path="/estadisticas" element={<RutaRol roles={['ATLETA']}><Estadisticas /></RutaRol>} />
            <Route path="/plantillas" element={<div className="p-8 text-gray-500">Plantillas (próximamente)</div>} />
            <Route path="/asignaciones" element={<div className="p-8 text-gray-500">Asignaciones (próximamente)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
