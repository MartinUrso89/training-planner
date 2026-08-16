import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle2, Clock3, MessageSquareQuote, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  obtenerEntrenamiento,
  completarEntrenamiento,
  registrarResultadoEjercicio,
  actualizarResultadoEjercicio,
} from '../services/entrenamientos'
import type { EntrenamientoDetalle, SeccionEntrenamiento, RegistroEjercicio, RegistrarResultadoInput } from '../services/entrenamientos'

function formatearFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearDuracion(segundos: number | null | undefined): string {
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

function numeroOVacio(v: string | null): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

interface Borrador {
  completado: boolean
  repeticionesReales: string
  pesoReal: string
  rpeReal: string
  duracionReal: string
  comentario: string
}

function borradorDesdeRegistro(r: RegistroEjercicio): Borrador {
  return {
    completado: r.completado,
    repeticionesReales: r.repeticionesReales !== null ? String(r.repeticionesReales) : '',
    pesoReal: r.pesoReal !== null ? String(r.pesoReal) : '',
    rpeReal: r.rpeReal !== null ? String(r.rpeReal) : '',
    duracionReal: r.duracionReal !== null ? String(r.duracionReal) : '',
    comentario: r.comentario ?? '',
  }
}

interface FilaRegistroProps {
  registro: RegistroEjercicio
  indice: number
  isGuardando: boolean
  onGuardar: (registro: RegistroEjercicio, cambios: Partial<Borrador>) => void
}

function FilaRegistro({ registro, indice, isGuardando, onGuardar }: FilaRegistroProps) {
  const [borrador, setBorrador] = useState<Borrador>(() => borradorDesdeRegistro(registro))

  useEffect(() => {
    setBorrador(borradorDesdeRegistro(registro))
  }, [registro])

  const inputCls =
    'w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  const aplicarYGuardar = (cambios: Partial<Borrador>) => {
    const nuevo = { ...borrador, ...cambios }
    setBorrador(nuevo)
    onGuardar(registro, cambios)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="w-6 text-xs font-semibold text-gray-400 shrink-0">#{indice + 1}</span>
      <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
        <input
          type="checkbox"
          checked={borrador.completado}
          onChange={(e) => aplicarYGuardar({ completado: e.target.checked })}
          className="w-4 h-4 accent-blue-600"
        />
        Hecho
      </label>
      <input
        type="number"
        min={0}
        className={`${inputCls} w-20`}
        placeholder="Reps"
        value={borrador.repeticionesReales}
        onChange={(e) => setBorrador({ ...borrador, repeticionesReales: e.target.value })}
        onBlur={() => onGuardar(registro, { repeticionesReales: borrador.repeticionesReales })}
      />
      <input
        type="number"
        min={0}
        step="0.5"
        className={`${inputCls} w-20`}
        placeholder="Peso kg"
        value={borrador.pesoReal}
        onChange={(e) => setBorrador({ ...borrador, pesoReal: e.target.value })}
        onBlur={() => onGuardar(registro, { pesoReal: borrador.pesoReal })}
      />
      <input
        type="number"
        min={0}
        step="0.5"
        max={10}
        className={`${inputCls} w-16`}
        placeholder="RPE"
        value={borrador.rpeReal}
        onChange={(e) => setBorrador({ ...borrador, rpeReal: e.target.value })}
        onBlur={() => onGuardar(registro, { rpeReal: borrador.rpeReal })}
      />
      <input
        type="number"
        min={0}
        className={`${inputCls} w-20`}
        placeholder="Seg"
        value={borrador.duracionReal}
        onChange={(e) => setBorrador({ ...borrador, duracionReal: e.target.value })}
        onBlur={() => onGuardar(registro, { duracionReal: borrador.duracionReal })}
      />
      <input
        type="text"
        className={`${inputCls} flex-1 min-w-32`}
        placeholder="Comentario de la serie"
        value={borrador.comentario}
        onChange={(e) => setBorrador({ ...borrador, comentario: e.target.value })}
        onBlur={() => onGuardar(registro, { comentario: borrador.comentario })}
      />
      {isGuardando && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
    </div>
  )
}

export default function RutinaDetalle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [rutina, setRutina] = useState<EntrenamientoDetalle | null>(null)
  const [secciones, setSecciones] = useState<SeccionEntrenamiento[]>([])
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const [comentarioFinal, setComentarioFinal] = useState('')
  const [isCompletando, setIsCompletando] = useState(false)
  const [errorCompletar, setErrorCompletar] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const [registrosGuardando, setRegistrosGuardando] = useState<Set<string>>(new Set())
  const [errorRegistro, setErrorRegistro] = useState('')

  const cargar = useCallback(async () => {
    if (!id) return
    setIsCargando(true)
    setError('')
    try {
      const data = await obtenerEntrenamiento(id)
      setRutina(data)
      setSecciones(data.secciones)
    } catch {
      setError('No se pudo cargar la rutina')
    } finally {
      setIsCargando(false)
    }
  }, [id])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const esEditable = user?.rol === 'ATLETA' && rutina !== null && !rutina.completado

  const actualizarRegistroLocal = (registro: RegistroEjercicio): void => {
    setSecciones((prev) =>
      prev.map((s) => ({
        ...s,
        ejercicios: s.ejercicios.map((e) => ({
          ...e,
          registros: e.registros.map((r) => (r.id === registro.id ? registro : r)),
        })),
      })),
    )
  }

  const guardarRegistro = async (registro: RegistroEjercicio, cambios: Partial<Borrador>) => {
    setRegistrosGuardando((prev) => new Set(prev).add(registro.id))
    setErrorRegistro('')
    try {
      const payload: RegistrarResultadoInput = {}
      if (cambios.completado !== undefined) payload.completado = cambios.completado
      if (cambios.repeticionesReales !== undefined) payload.repeticionesReales = numeroOVacio(cambios.repeticionesReales)
      if (cambios.pesoReal !== undefined) payload.pesoReal = numeroOVacio(cambios.pesoReal)
      if (cambios.rpeReal !== undefined) payload.rpeReal = numeroOVacio(cambios.rpeReal)
      if (cambios.duracionReal !== undefined) payload.duracionReal = numeroOVacio(cambios.duracionReal)
      if (cambios.comentario !== undefined) payload.comentario = cambios.comentario.trim() || null
      const actualizado = await actualizarResultadoEjercicio(registro.id, payload)
      actualizarRegistroLocal(actualizado)
    } catch {
      setErrorRegistro('No se pudo guardar el resultado. Revisá tus datos.')
      void cargar()
    } finally {
      setRegistrosGuardando((prev) => {
        const nuevo = new Set(prev)
        nuevo.delete(registro.id)
        return nuevo
      })
    }
  }

  const agregarSerie = async (ejercicioId: string) => {
    setErrorRegistro('')
    try {
      const creado = await registrarResultadoEjercicio(ejercicioId, {})
      setSecciones((prev) =>
        prev.map((s) => ({
          ...s,
          ejercicios: s.ejercicios.map((e) =>
            e.id === ejercicioId ? { ...e, registros: [...e.registros, creado] } : e,
          ),
        })),
      )
    } catch {
      setErrorRegistro('No se pudo agregar la serie')
    }
  }

  const handleCompletar = async () => {
    if (!id) return
    setIsCompletando(true)
    setErrorCompletar('')
    try {
      await completarEntrenamiento(id, comentarioFinal.trim() || undefined)
      setConfirmando(false)
      void cargar()
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setErrorCompletar(axiosErr.response?.data?.error ?? 'No se pudo completar la rutina')
    } finally {
      setIsCompletando(false)
    }
  }

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

      {errorRegistro && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorRegistro}
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

          {secciones.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {s.nombre ?? `Sección ${s.orden}`}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {s.rondas && <span>{s.rondas} rondas</span>}
                  {s.tiempoLimite && <span>Límite {formatearDuracion(s.tiempoLimite)}</span>}
                </div>
              </div>

              {s.ejercicios.map((e) => (
                <div key={e.id} className="px-5 py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{e.ejercicio.nombre}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Plan: {formatearPlan(e)}</p>
                    </div>
                    {esEditable && (
                      <button
                        onClick={() => void agregarSerie(e.id)}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar serie
                      </button>
                    )}
                  </div>

                  {esEditable ? (
                    <div className="mt-3">
                      {e.registros.length === 0 && (
                        <p className="text-sm text-gray-400">Sin series cargadas todavía.</p>
                      )}
                      {e.registros.map((r, i) => (
                        <FilaRegistro
                          key={r.id}
                          registro={r}
                          indice={i}
                          isGuardando={registrosGuardando.has(r.id)}
                          onGuardar={(reg, cambios) => void guardarRegistro(reg, cambios)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2">
                      {e.registros.filter((r) => r.completado).length > 0 ? (
                        <ul className="space-y-1">
                          {e.registros.filter((r) => r.completado).map((r) => {
                            const partes: string[] = []
                            if (r.repeticionesReales) partes.push(`${r.repeticionesReales} reps`)
                            if (r.pesoReal) partes.push(`${r.pesoReal} kg`)
                            if (r.rpeReal) partes.push(`RPE ${r.rpeReal}`)
                            if (r.duracionReal) partes.push(formatearDuracion(r.duracionReal))
                            return (
                              <li key={r.id} className="text-sm text-gray-600">
                                <span className="text-green-600 mr-1.5">✓</span>
                                {partes.join(' · ') || 'completado'}
                                {r.comentario && <span className="text-gray-400 italic"> · {r.comentario}</span>}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">Sin registros completados.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {esEditable && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Completar rutina</h3>
              <p className="text-sm text-gray-500 mb-3">
                Cuando termines, marcá la rutina como completada. Podés dejar un comentario general.
              </p>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Comentario general de la sesión (opcional)"
                value={comentarioFinal}
                onChange={(e) => setComentarioFinal(e.target.value)}
              />
              {errorCompletar && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorCompletar}
                </div>
              )}
              {confirmando ? (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => void handleCompletar()}
                    disabled={isCompletando}
                    className="flex items-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isCompletando ? 'Completando…' : 'Confirmar completado'}
                  </button>
                  <button
                    onClick={() => setConfirmando(false)}
                    disabled={isCompletando}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmando(true)}
                  className="mt-4 flex items-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completar rutina
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No se encontró la rutina</div>
      )}
    </div>
  )
}
