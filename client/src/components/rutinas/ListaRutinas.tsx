import { AlertCircle, CalendarCheck, ChevronRight } from 'lucide-react'
import Paginacion from '../ejercicios/Paginacion'

export interface ItemRutina {
  id: string
  fecha: string
  nombre: string
  comentario?: string | null
  asignadoPor?: string | null
}

function formatearFechaCorta(iso: string): string {
  const d = new Date(iso)
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

interface ListaRutinasProps {
  items: ItemRutina[]
  total: number
  pagina: number
  limite: number
  onCambiarPagina: (pagina: number) => void
  onVerDetalle: (id: string) => void
  isCargando: boolean
  error: string
  vacio: string
  etiquetaAccion?: string
}

export default function ListaRutinas({ items, total, pagina, limite, onCambiarPagina, onVerDetalle, isCargando, error, vacio, etiquetaAccion = 'Ver detalle' }: ListaRutinasProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border-b border-red-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {isCargando ? (
        <div className="p-10 text-center text-gray-400">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {vacio}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-3">
              <div className="flex items-center gap-2 text-sm">
                <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="font-bold text-gray-900 whitespace-nowrap">{formatearFechaCorta(item.fecha)}</span>
                <span className="text-gray-400">-</span>
                <span className="font-medium text-gray-900 whitespace-nowrap">{item.nombre}</span>
                {item.asignadoPor && (
                  <span className="hidden md:inline text-gray-400 truncate">· {item.asignadoPor}</span>
                )}
                {item.comentario && (
                  <>
                    <span className="text-gray-400">-</span>
                    <span className="italic text-gray-600 truncate min-w-0">{item.comentario}</span>
                  </>
                )}
                <button
                  onClick={() => onVerDetalle(item.id)}
                  className="ml-auto shrink-0 flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  {etiquetaAccion}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!isCargando && items.length > 0 && (
        <div className="py-4 border-t border-gray-100">
          <Paginacion pagina={pagina} totalPaginas={Math.max(1, Math.ceil(total / limite))} onChange={onCambiarPagina} />
        </div>
      )}
    </div>
  )
}
