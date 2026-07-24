import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard,
  Users,
  Calendar,
  NotebookText,
  ChevronDown,
  FileText,
  ClipboardList,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Inicio', icon: LayoutDashboard, to: '/' },
  { label: 'Entrenados', icon: Users, to: '#' },
  { label: 'Calendario', icon: Calendar, to: '#' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [plansOpen, setPlansOpen] = useState(true)

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 h-screen bg-[#0F172A] text-white flex flex-col shrink-0">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Avatar name={user?.name ?? '?'} size="sm" />
        <span className="text-sm font-semibold truncate">{user?.name}</span>
      </div>

      <div className="h-px bg-white/10 mx-4" />

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.to)
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {/* Planes (colapsable) */}
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
      </nav>

      <div className="h-px bg-white/10 mx-4 my-2" />

      {/* Cerrar sesión */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
