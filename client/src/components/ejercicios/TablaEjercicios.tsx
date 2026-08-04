import { ExternalLink } from 'lucide-react'
import type { Ejercicio } from '../../services/ejercicios'

interface Props {
  ejercicios: Ejercicio[]
  loading: boolean
}

export default function TablaEjercicios({ ejercicios, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Cargando ejercicios…
      </div>
    )
  }

  if (ejercicios.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No se encontraron ejercicios con los filtros seleccionados.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">M. Principal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">M. Secundario</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo Articular</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Patrón</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Video</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ejercicios.map((ej) => (
              <tr key={ej.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{ej.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{ej.musculoPrincipal}</td>
                <td className="px-4 py-3 text-gray-600">{ej.musculoSecundario ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    ej.tipoArticular === 'Poliarticular'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-purple-50 text-purple-600'
                  }`}>
                    {ej.tipoArticular}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{ej.patronMovimiento}</td>
                <td className="px-4 py-3">
                  {ej.videoUrl ? (
                    <a href={ej.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-3.5 h-3.5" /> Ver
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{ej.descripcion ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
