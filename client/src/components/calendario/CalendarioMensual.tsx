import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { obtenerMisEntrenamientos } from '../../services/entrenamientos'
import type { MisEntrenamiento } from '../../services/entrenamientos'

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function diaClave(iso: string): string {
  return iso.slice(0, 10)
}

function formatearTitulo(anio: number, mes: number): string {
  const fecha = new Date(anio, mes, 1)
  return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

export default function CalendarioMensual() {
  const navigate = useNavigate()
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [porDia, setPorDia] = useState<Record<string, MisEntrenamiento[]>>({})
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const desde = `${anio}-${String(mes + 1).padStart(2, '0')}-01T00:00:00.000Z`
  const hasta = `${anio}-${String(mes + 1).padStart(2, '0')}-${new Date(anio, mes + 1, 0).getDate()}T23:59:59.000Z`

  const cargar = useCallback(async () => {
    setIsCargando(true)
    setError('')
    try {
      const res = await obtenerMisEntrenamientos({ desde, hasta, pagina: 1, limite: 50 })
      const mapa: Record<string, MisEntrenamiento[]> = {}
      for (const r of res.datos) {
        const clave = diaClave(r.fecha)
        mapa[clave] = [...(mapa[clave] ?? []), r]
      }
      setPorDia(mapa)
    } catch {
      setError('No se pudieron cargar las rutinas')
    } finally {
      setIsCargando(false)
    }
  }, [desde, hasta])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const diasDelMes = useMemo(() => {
    const total = new Date(anio, mes + 1, 0).getDate()
    const primero = new Date(anio, mes, 1)
    const offset = (primero.getDay() + 6) % 7
    const celdas: (number | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= total; d++) celdas.push(d)
    while (celdas.length % 7 !== 0) celdas.push(null)
    return celdas
  }, [anio, mes])

  const moverMes = (delta: number) => {
    const fecha = new Date(anio, mes + delta, 1)
    setAnio(fecha.getFullYear())
    setMes(fecha.getMonth())
  }

  const claveDia = (dia: number) => `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 capitalize">{formatearTitulo(anio, mes)}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => moverMes(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setAnio(hoy.getFullYear())
              setMes(hoy.getMonth())
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => moverMes(1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">
              {d}
            </div>
          ))}
        </div>

        {isCargando ? (
          <div className="p-10 text-center text-gray-400">Cargando…</div>
        ) : (
          <div className="grid grid-cols-7">
            {diasDelMes.map((dia, i) => {
              if (dia === null) return <div key={`vacio-${i}`} className="min-h-20 border-b border-r border-gray-50" />
              const clave = claveDia(dia)
              const rutinas = porDia[clave] ?? []
              const esHoy = clave === diaClave(new Date().toISOString())
              return (
                <button
                  key={clave}
                  className={`min-h-20 p-2 border-b border-r border-gray-50 text-left align-top hover:bg-gray-50 transition-colors ${
                    esHoy ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <span
                    className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-sm font-medium ${
                      esHoy ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    {dia}
                  </span>
                  <div className="mt-1 space-y-1">
                    {rutinas.slice(0, 3).map((r) => (
                      <span
                        key={r.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/entrenamientos/${r.id}`)
                        }}
                        title={r.nombreRutina ?? 'Rutina'}
                        className={`block truncate text-xs px-1.5 py-0.5 rounded-md font-medium cursor-pointer ${
                          r.completado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.nombreRutina ?? 'Rutina'}
                      </span>
                    ))}
                    {rutinas.length > 3 && (
                      <span className="text-xs text-gray-400">+{rutinas.length - 3} más</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {!isCargando && Object.values(porDia).some((r) => r.length > 0) && (
        <p className="mt-3 text-sm text-gray-500">
          Verde: completada · Ámbar: pendiente. Tocá una rutina para verla.
        </p>
      )}
    </div>
  )
}
