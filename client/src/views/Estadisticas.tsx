import { BarChart3 } from 'lucide-react'

export default function Estadisticas() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-sm text-gray-500">Tu progreso de entrenamiento</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        Estadísticas (próximamente)
      </div>
    </div>
  )
}
