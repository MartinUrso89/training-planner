import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-gray-900" />
            <h1 className="text-lg font-bold text-gray-900">Training Planner</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, {user?.name}</h2>
        <p className="text-gray-500 mb-8">Esta es tu vista principal. Acá vas a gestionar tus planes de entrenamiento.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <Dumbbell className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ejercicios</h3>
            <p className="text-sm text-gray-500">Administrá tu catálogo de ejercicios</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Planes</h3>
            <p className="text-sm text-gray-500">Creá y gestioná tus planes de entrenamiento</p>
          </div>
        </div>
      </main>
    </div>
  )
}
