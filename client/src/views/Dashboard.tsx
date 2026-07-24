import { useNavigate } from 'react-router-dom'
import { Dumbbell, FileText, Users, ClipboardList } from 'lucide-react'

const cards = [
  { icon: Dumbbell, label: 'Ejercicios', desc: 'Administrá tu catálogo de ejercicios', to: '/ejercicios', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FileText, label: 'Plantillas', desc: 'Creá y gestioná plantillas de entrenamiento', to: '/plantillas', color: 'bg-blue-50 text-blue-600' },
  { icon: Users, label: 'Entrenados', desc: 'Gestioná tus entrenados', to: '/entrenados', color: 'bg-purple-50 text-purple-600' },
  { icon: ClipboardList, label: 'Asignaciones', desc: 'Asigná planes y seguí el progreso', to: '/asignaciones', color: 'bg-amber-50 text-amber-600' },
]

export default function Dashboard() {
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
