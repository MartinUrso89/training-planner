import { X } from 'lucide-react'
import type { Ejercicio } from '../../services/ejercicios'
import { obtenerUrlIncrustable } from '../../services/ejercicios'

interface Props {
  ejercicio: Ejercicio | null
  onCerrar: () => void
}

export default function TarjetaDetalleEjercicio({ ejercicio, onCerrar }: Props) {
  if (!ejercicio) {
    return (
    <aside className="w-80 shrink-0 h-full">
      <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center p-8">
          <p className="text-sm text-gray-400 text-center">
            Seleccioná un ejercicio para ver su detalle
          </p>
        </div>
      </aside>
    )
  }

  const urlVideo = obtenerUrlIncrustable(ejercicio.videoUrl)

  return (
    <aside className="w-80 shrink-0 h-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">{ejercicio.nombre}</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {urlVideo ? (
            <iframe
              src={urlVideo}
              className="w-full aspect-video rounded-lg bg-gray-100"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`Video de ${ejercicio.nombre}`}
            />
          ) : (
            <p className="text-sm text-gray-400">Sin video disponible</p>
          )}

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Descripción</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{ejercicio.descripcion ?? 'Sin descripción'}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Grupo muscular</h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {ejercicio.musculoPrincipal}
              </span>
              {ejercicio.musculoSecundario && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {ejercicio.musculoSecundario}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Tipo articular</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              ejercicio.tipoArticular === 'Poliarticular'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-purple-50 text-purple-600'
            }`}>
              {ejercicio.tipoArticular}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Patrón de movimiento</h3>
            <p className="text-sm text-gray-700">{ejercicio.patronMovimiento}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
