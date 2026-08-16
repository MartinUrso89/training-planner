import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, FileText, Users, ClipboardList, ListTodo, History, BarChart3, PlayCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { obtenerMisEntrenamientos } from '../services/entrenamientos'
import type { MisEntrenamiento } from '../services/entrenamientos'
import CalendarioMensual from '../components/calendario/CalendarioMensual'

const cards = [
  { icon: Dumbbell, label: 'Ejercicios', desc: 'Administrá tu catálogo de ejercicios', to: '/ejercicios', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FileText, label: 'Plantillas', desc: 'Creá y gestioná plantillas de entrenamiento', to: '/plantillas', color: 'bg-blue-50 text-blue-600' },
  { icon: Users, label: 'Entrenados', desc: 'Gestioná tus entrenados', to: '/entrenados', color: 'bg-purple-50 text-purple-600' },
  { icon: ClipboardList, label: 'Asignaciones', desc: 'Asigná planes y seguí el progreso', to: '/asignaciones', color: 'bg-amber-50 text-amber-600' },
]

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function DashboardEntrenador() {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Panel de control</h1>
      <p className="text-gray-500 mb-8">Bienvenido al gestor de entrenamiento</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-sm transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.label}</h3>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function DashboardAtleta() {
  const navigate = useNavigate()
  const [proxima, setProxima] = useState<MisEntrenamiento | null>(null)
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setIsCargando(true)
    setError('')
    try {
      const pendientes = await obtenerMisEntrenamientos({ completado: false, pagina: 1, limite: 1 })
      setProxima(pendientes.datos[0] ?? null)
    } catch {
      setError('No se pudieron cargar tus rutinas')
    } finally {
      setIsCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const atajos = [
    { icon: ListTodo, label: 'Mis rutinas', desc: 'Rutinas pendientes por hacer', to: '/mis-rutinas', color: 'bg-blue-50 text-blue-600' },
    { icon: History, label: 'Histórico', desc: 'Rutinas ya completadas', to: '/historico', color: 'bg-purple-50 text-purple-600' },
    { icon: BarChart3, label: 'Estadísticas', desc: 'Tu progreso', to: '/estadisticas', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Hola, buen entrenamiento</h1>
      <p className="text-gray-500 mb-8">Tu plan de hoy, listo para arrancar</p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-900 mb-4">Secciones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {atajos.map((card) => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-sm transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.label}</h3>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-4">Próximo entrenamiento</h2>
      {isCargando ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Cargando…</div>
      ) : (
        <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {proxima ? (
            <>
              <div>
                <h3 className="text-lg font-bold">{proxima.nombreRutina ?? 'Rutina'}</h3>
                <p className="text-sm text-white/85">{formatearFecha(proxima.fecha)}</p>
                {proxima.asignadoPor && (
                  <p className="text-sm text-white/70">Asignada por {proxima.asignadoPor.nombre}</p>
                )}
              </div>
              <button
                onClick={() => navigate(`/entrenamientos/${proxima.id}`)}
                className="flex items-center justify-center gap-2 bg-white text-blue-700 py-2.5 px-5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shrink-0"
              >
                <PlayCircle className="w-5 h-5" />
                Comenzar próximo entrenamiento asignado
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-bold">No tenés rutinas pendientes</h3>
                <p className="text-sm text-white/80 mt-0.5">Disfrutá el descanso o revisá tu histórico</p>
              </div>
              <button
                onClick={() => navigate('/historico')}
                className="flex items-center justify-center gap-2 bg-white text-blue-700 py-2.5 px-5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shrink-0"
              >
                <History className="w-5 h-5" />
                Ver histórico
              </button>
            </>
          )}
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-4">Calendario</h2>
      <CalendarioMensual />
    </div>
  )
}

export default function Dashboard() {
  const { user, isCargando } = useAuth()

  if (isCargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return user?.rol === 'ATLETA' ? <DashboardAtleta /> : <DashboardEntrenador />
}
