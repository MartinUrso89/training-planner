import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent, ChangeEvent } from 'react'
import { UserPlus, X, AlertCircle, CheckCircle2, Search, UserRound } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Paginacion from '../components/ejercicios/Paginacion'
import { listarEntrenados, OBJETIVO_ETIQUETAS } from '../services/entrenados'
import type { Entrenado } from '../services/entrenados'
import { enviarSolicitud } from '../services/vinculaciones'

const LIMITE = 8

const estadoEstilos: Record<Entrenado['estado'], string> = {
  Activo: 'bg-green-100 text-green-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Inactivo: 'bg-gray-100 text-gray-600',
}

function formatearFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Entrenados() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<'' | 'Pendiente' | 'Activo' | 'Inactivo'>('')
  const [soloConPendientes, setSoloConPendientes] = useState(false)
  const [pagina, setPagina] = useState(1)

  const [datos, setDatos] = useState<Entrenado[]>([])
  const [total, setTotal] = useState(0)
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [correo, setCorreo] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalExito, setModalExito] = useState('')
  const [isEnviando, setIsEnviando] = useState(false)

  const cargar = useCallback(async () => {
    setIsCargando(true)
    setError('')
    try {
      const res = await listarEntrenados({
        busqueda: busqueda.trim() || undefined,
        estado: estado || undefined,
        tienePendientes: soloConPendientes || undefined,
        pagina,
        limite: LIMITE,
      })
      setDatos(res.datos)
      setTotal(res.total)
    } catch {
      setError('Error al cargar los entrenados')
    } finally {
      setIsCargando(false)
    }
  }, [busqueda, estado, soloConPendientes, pagina])

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargar()
    }, 300)
    return () => clearTimeout(timer)
  }, [cargar])

  const resetearPagina = () => setPagina(1)

  const abrirModal = () => {
    setCorreo('')
    setModalError('')
    setModalExito('')
    setModalAbierto(true)
  }

  const handleSolicitud = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalError('')
    setModalExito('')
    setIsEnviando(true)
    try {
      await enviarSolicitud(correo)
      setModalExito('Solicitud enviada. El atleta deberá aceptarla.')
      setCorreo('')
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setModalError(axiosErr.response?.data?.error ?? 'Error al enviar la solicitud')
    } finally {
      setIsEnviando(false)
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrenados</h1>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Agregar entrenando
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nombre"
            className="w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={busqueda}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setBusqueda(e.target.value)
              resetearPagina()
            }}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={estado}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setEstado(e.target.value as '' | 'Pendiente' | 'Activo' | 'Inactivo')
            resetearPagina()
          }}
        >
          <option value="">Estado: todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={soloConPendientes ? 'si' : 'todos'}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setSoloConPendientes(e.target.value === 'si')
            resetearPagina()
          }}
        >
          <option value="todos">Rutinas pendientes: todas</option>
          <option value="si">Con rutinas pendientes</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="px-5 py-3 font-medium">Atleta</th>
              <th className="px-5 py-3 font-medium">Objetivo principal</th>
              <th className="px-5 py-3 font-medium">Días/Semana</th>
              <th className="px-5 py-3 font-medium">Último entrenamiento</th>
              <th className="px-5 py-3 font-medium">Rutinas pendientes</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isCargando ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">Cargando…</td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  <UserRound className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Sin atletas que coincidan
                </td>
              </tr>
            ) : (
              datos.map((d) => (
                <tr key={d.vinculacionId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.atleta.nombre} size="sm" />
                      <span className="font-medium text-gray-900">{d.atleta.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {d.objetivoPrincipal ? OBJETIVO_ETIQUETAS[d.objetivoPrincipal] : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{d.diasPorSemana ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{formatearFecha(d.ultimoEntrenamiento)}</td>
                  <td className="px-5 py-3">
                    {d.rutinasPendientes > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {d.rutinasPendientes}
                      </span>
                    ) : (
                      <span className="text-gray-300">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${estadoEstilos[d.estado]}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/entrenados/${d.atleta.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver perfil completo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Agregar entrenando</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Escribí el correo del atleta para enviarle una solicitud de vinculación.
            </p>

            {modalError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
              </div>
            )}
            {modalExito && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {modalExito}
              </div>
            )}

            <form onSubmit={handleSolicitud} className="space-y-4">
              <div>
                <label htmlFor="emailAtleta" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo del atleta
                </label>
                <input
                  id="emailAtleta"
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="atleta@email.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isEnviando}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isEnviando ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
