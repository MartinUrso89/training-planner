import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle2, Clock3, MessageSquareQuote } from 'lucide-react'
import { obtenerEntrenamiento } from '../services/entrenamientos'
import type { EntrenamientoDetalle } from '../services/entrenamientos'

function formatearFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearDuracion(segundos: number | null): string {
  if (segundos === null || segundos === undefined) return '—'
  if (segundos < 60) return `${segundos}s`
  const min = Math.floor(segundos / 60)
  const sec = segundos % 60
  return sec ? `${min}m ${sec}s` : `${min}m`
}

function formatearPlan(e: { seriesPrevistas: number | null; repeticionesPrevistas: number | null; duracionPrevista: number | null; pesoPrevisto: number | null }): string {
  const partes: string[] = []
  if (e.duracionPrevista) {
    partes.push(formatearDuracion(e.duracionPrevista))
  } else {
    if (e.seriesPrevistas) partes.push(`${e.seriesPrevistas} series`)
    if (e.repeticionesPrevistas) partes.push(`${e.repeticionesPrevistas} reps`)
    if (e.pesoPrevisto) partes.push(`${e.pesoPrevisto} kg`)
  }
  return partes.join(' · ') || '—'
}

export default function RutinaDetalle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [rutina, setRutina] = useState<EntrenamientoDetalle | null>(null)
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    if (!id) return
    setIsCargando(true)
    setError('')
    try {
      setRutina(await obtenerEntrenamiento(id))
    } catch {
      setError('No se pudo cargar la rutina')
    } finally {
      setIsCargando(false)
    }
  }, [id])

  useEffect(() => {
    void cargar()
  }, [cargar])

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Detalle de la rutina</h1>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {isCargando ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Cargando…</div>
      ) : rutina ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{rutina.nombreRutina ?? 'Rutina'}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4 text-gray-400" />
                    Prevista: {formatearFecha(rutina.fecha)}
                  </span>
                  {rutina.completadoEn && (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ejecutada: {formatearFecha(rutina.completadoEn)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  rutina.completado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {rutina.completado ? 'Completada' : 'Pendiente'}
              </span>
            </div>

            {rutina.comentario && (
              <p className="mt-4 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <MessageSquareQuote className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <span className="italic">{rutina.comentario}</span>
              </p>
            )}
          </div>

          {rutina.secciones.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {s.nombre ?? `Sección ${s.orden}`}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {s.rondas && <span>{s.rondas} rondas</span>}
                  {s.tiempoLimite && <span>Límite {formatearDuracion(s.tiempoLimite)}</span>}
                  {s.rondasCompletadas !== null && (
                    <span>Rondas completadas: {s.rondasCompletadas ?? 0}</span>
                  )}
                  {s.tiempoTotalReal !== null && (
                    <span>Tiempo real: {formatearDuracion(s.tiempoTotalReal)}</span>
                  )}
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-2.5 font-medium">Ejercicio</th>
                    <th className="px-5 py-2.5 font-medium">Plan</th>
                    <th className="px-5 py-2.5 font-medium">Registros</th>
                    <th className="px-5 py-2.5 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {s.ejercicios.map((e) => {
                    const registros = e.registros.filter((r) => r.completado)
                    const real = registros
                      .map((r) => {
                        const partes: string[] = []
                        if (r.repeticionesReales) partes.push(`${r.repeticionesReales} reps`)
                        if (r.pesoReal) partes.push(`${r.pesoReal} kg`)
                        if (r.duracionReal) partes.push(formatearDuracion(r.duracionReal))
                        return partes.join(' · ') || 'completado'
                      })
                      .join(', ')
                    const comentarios = e.registros
                      .map((r) => r.comentario)
                      .filter((c): c is string => Boolean(c))
                    return (
                      <tr key={e.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-gray-900">{e.ejercicio.nombre}</td>
                        <td className="px-5 py-3 text-gray-600">{formatearPlan(e)}</td>
                        <td className="px-5 py-3 text-gray-600">{real || '—'}</td>
                        <td className="px-5 py-3 text-gray-500">
                          {comentarios.length > 0 ? (
                            <span className="italic">{comentarios.join(' · ')}</span>
                          ) : (
                            e.notas || '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No se encontró la rutina</div>
      )}
    </div>
  )
}
