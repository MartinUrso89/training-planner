import { useState, useEffect } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { obtenerGruposMusculares } from '../../services/ejercicios'
import type { FiltrosEjercicio } from '../../services/ejercicios'

const TIPOS_ARTICULARES = ['Poliarticular', 'Monoarticular']

const PATRONES_MOVIMIENTO = [
  'Empuje', 'Traccion', 'DominanteRodilla', 'DominanteCadera',
  'Rotacion', 'Antirrotacion', 'Flexion', 'Extension',
]

interface Props {
  filtros: FiltrosEjercicio
  onChange: (filtros: FiltrosEjercicio) => void
  onLimpiar?: () => void
  limpiarDeshabilitado?: boolean
}

export default function FiltrosEjercicios({ filtros, onChange, onLimpiar, limpiarDeshabilitado }: Props) {
  const [gruposPrincipales, setGruposPrincipales] = useState<string[]>([])

  useEffect(() => {
    obtenerGruposMusculares().then(setGruposPrincipales).catch(() => {})
  }, [])

  const actualizar = (campo: keyof FiltrosEjercicio, valor: string) => {
    onChange({ ...filtros, [campo]: valor || undefined })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.buscar ?? ''}
            onChange={(e) => actualizar('buscar', e.target.value)}
          />
        </div>

        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filtros.tipoArticular ?? ''}
          onChange={(e) => actualizar('tipoArticular', e.target.value)}
        >
          <option value="">Tipo articular</option>
          {TIPOS_ARTICULARES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filtros.patronMovimiento ?? ''}
          onChange={(e) => actualizar('patronMovimiento', e.target.value)}
        >
          <option value="">Patrón movimiento</option>
          {PATRONES_MOVIMIENTO.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filtros.musculoPrincipal ?? ''}
          onChange={(e) => actualizar('musculoPrincipal', e.target.value)}
        >
          <option value="">Músculo principal</option>
          {gruposPrincipales.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {onLimpiar && (
        <button
          onClick={onLimpiar}
          disabled={limpiarDeshabilitado}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Limpiar
        </button>
      )}
    </div>
  )
}
