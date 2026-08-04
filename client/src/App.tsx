import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SidebarLayout from './components/layout/SidebarLayout'
import Login from './views/Login'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import Ejercicios from './views/Ejercicios'

const PrivateRoute = ({ children }: { children: ReactNode }): ReactNode =>
  localStorage.getItem('accessToken') !== null ? children : <Navigate to="/login" replace />

export default function App(): ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute><SidebarLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/entrenados" element={<div className="p-8 text-gray-500">Entrenados (próximamente)</div>} />
          <Route path="/calendario" element={<div className="p-8 text-gray-500">Calendario (próximamente)</div>} />
          <Route path="/plantillas" element={<div className="p-8 text-gray-500">Plantillas (próximamente)</div>} />
          <Route path="/asignaciones" element={<div className="p-8 text-gray-500">Asignaciones (próximamente)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
