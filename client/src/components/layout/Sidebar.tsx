import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  Calendar,
  NotebookText,
  ChevronDown,
  FileText,
  ClipboardList,
  ListTodo,
  History,
  BarChart3,
  LogOut,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  to: string
  disabled?: boolean
}

const navItemsEntrenador: NavItem[] = [
  { label: 'Inicio', icon: LayoutDashboard, to: '/' },
  { label: 'Ejercicios', icon: Dumbbell, to: '/ejercicios' },
  { label: 'Atletas', icon: Users, to: '/entrenados' },
  { label: 'Calendario', icon: Calendar, to: '#', disabled: true },
]

const navItemsAtleta: NavItem[] = [
  { label: 'Inicio', icon: LayoutDashboard, to: '/' },
  { label: 'Mis rutinas', icon: ListTodo, to: '/mis-rutinas' },
  { label: 'Histórico', icon: History, to: '/historico' },
  { label: 'Estadísticas', icon: BarChart3, to: '/estadisticas' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [plansOpen, setPlansOpen] = useState(true)
  const [modalLogout, setModalLogout] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const confirmarLogout = () => {
    logout()
    navigate('/login')
  }

  const esAtleta = user?.rol === 'ATLETA'

  return (
    <aside className="w-60 h-screen bg-[#0F172A] text-white flex flex-col shrink-0">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Avatar name={user?.nombre ?? '?'} size="sm" />
        <span className="text-sm font-semibold truncate">{user?.nombre}</span>
      </div>

      <div className="h-px bg-white/10 mx-4" />

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-4">
        {(esAtleta ? navItemsAtleta : navItemsEntrenador).map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              item.disabled
                ? 'text-white/30 cursor-default pointer-events-none'
                : isActive(item.to)
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {!esAtleta && (
          <div>
            <button
              onClick={() => setPlansOpen(!plansOpen)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/plantillas') || isActive('/asignaciones')
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <NotebookText className="w-4 h-4" />
                Planes
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${plansOpen ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>

            {plansOpen && (
              <div className="ml-7 mt-0.5 space-y-0.5">
                <Link
                  to="/plantillas"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/plantillas')
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Plantillas
                </Link>
                <Link
                  to="/asignaciones"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/asignaciones')
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Asignaciones
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="h-px bg-white/10 mx-4 my-2" />

      {/* Cerrar sesión */}
      <div className="px-3 pb-4">
        <button
          onClick={() => setModalLogout(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      {modalLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Cerrar sesión</h2>
              <button
                onClick={() => setModalLogout(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">¿Seguro que querés cerrar tu sesión?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalLogout(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
