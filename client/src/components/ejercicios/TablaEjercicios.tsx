import type { Ejercicio } from '../../services/ejercicios'
import { urlImagenEjercicio } from '../../services/ejercicios'

interface Props {
  ejercicios: Ejercicio[]
  loading: boolean
  seleccionadoId?: string | null
  onSeleccionar: (ejercicio: Ejercicio) => void
}

export default function TablaEjercicios({ ejercicios, loading, seleccionadoId, onSeleccionar }: Props) {
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Imagen</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Grupo muscular</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo Articular</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ejercicios.map((ej) => {
              const src = urlImagenEjercicio(ej.imagenUrl)
              const seleccionado = seleccionadoId === ej.id
              return (
                <tr
                  key={ej.id}
                  onClick={() => onSeleccionar(ej)}
                  className={`transition-colors cursor-pointer ${seleccionado ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    {src ? (
                      <img src={src} alt={ej.nombre} width={30} height={50}
                        className="w-[30px] h-[50px] object-cover rounded bg-gray-100" loading="lazy" />
                    ) : (
                      <span className="inline-block w-[30px] h-[50px] rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{ej.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {ej.musculoPrincipal}
                      </span>
                      {ej.musculoSecundario && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {ej.musculoSecundario}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      ej.tipoArticular === 'Poliarticular'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      {ej.tipoArticular}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
