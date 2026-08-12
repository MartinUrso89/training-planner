import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { ArrowLeft, Pencil, X, AlertCircle, CalendarCheck, ListTodo, BarChart3, UserRound, ChevronRight } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Paginacion from '../components/ejercicios/Paginacion'
import { obtenerEntrenado, guardarPerfilAtleta, OBJETIVO_ETIQUETAS } from '../services/entrenados'
import { obtenerEntrenamientosRealizados, obtenerRutinasPendientes } from '../services/entrenamientos'
import type { PerfilEntrenado, ObjetivoPrincipal } from '../services/entrenados'
import type { EntrenamientoRealizado, RutinaPendiente } from '../services/entrenamientos'

const estadoEstilos: Record<PerfilEntrenado['estado'], string> = {
  Activo: 'bg-green-100 text-green-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  Inactivo: 'bg-gray-100 text-gray-600',
}

const LIMITE_RUTINAS = 15

const tabs = [
  { id: 'realizados', icon: CalendarCheck, label: 'Entrenamientos realizados' },
  { id: 'pendientes', icon: ListTodo, label: 'Rutinas pendientes' },
  { id: 'estadisticas', icon: BarChart3, label: 'Estadísticas' },
] as const

type TabId = (typeof tabs)[number]['id']

function formatearFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearFechaCorta(iso: string): string {
  const d = new Date(iso)
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

interface ItemRutinaProps {
  id: string
  fecha: string
  nombre: string
  comentario?: string | null
  onVerDetalle: () => void
}

function ItemRutina({ fecha, nombre, comentario, onVerDetalle }: ItemRutinaProps) {
  return (
    <li className="px-5 py-3">
      <div className="flex items-center gap-2 text-sm">
        <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
        <span className="font-bold text-gray-900 whitespace-nowrap">{formatearFechaCorta(fecha)}</span>
        <span className="text-gray-400">-</span>
        <span className="font-medium text-gray-900 whitespace-nowrap">{nombre}</span>
        {comentario && (
          <>
            <span className="text-gray-400">-</span>
            <span className="italic text-gray-600 truncate min-w-0">{comentario}</span>
          </>
        )}
        <button
          onClick={onVerDetalle}
          className="ml-auto shrink-0 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver detalle
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  )
}

interface ListadoRutinasProps {
  items: ItemRutinaProps[]
  total: number
  pagina: number
  onCambiarPagina: (pagina: number) => void
  isCargando: boolean
  error: string
  vacio: string
}

function ListadoRutinas({ items, total, pagina, onCambiarPagina, isCargando, error, vacio }: ListadoRutinasProps) {
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
            <ItemRutina key={item.id} {...item} />
          ))}
        </ul>
      )}
      {!isCargando && items.length > 0 && (
        <div className="py-4 border-t border-gray-100">
          <Paginacion pagina={pagina} totalPaginas={Math.max(1, Math.ceil(total / LIMITE_RUTINAS))} onChange={onCambiarPagina} />
        </div>
      )}
    </div>
  )
}

export default function PerfilEntrenado() {
  const navigate = useNavigate()
  const { atletaId } = useParams<{ atletaId: string }>()

  const [perfil, setPerfil] = useState<PerfilEntrenado | null>(null)
  const [isCargando, setIsCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [objetivo, setObjetivo] = useState<ObjetivoPrincipal | ''>('')
  const [dias, setDias] = useState(3)
  const [descripcion, setDescripcion] = useState('')
  const [modalError, setModalError] = useState('')
  const [isEnviando, setIsEnviando] = useState(false)

  const [tabActivo, setTabActivo] = useState<TabId>('realizados')
  const [realizados, setRealizados] = useState<EntrenamientoRealizado[]>([])
  const [totalRealizados, setTotalRealizados] = useState(0)
  const [paginaRealizados, setPaginaRealizados] = useState(1)
  const [isCargandoRealizados, setIsCargandoRealizados] = useState(false)
  const [errorRealizados, setErrorRealizados] = useState('')

  const [pendientes, setPendientes] = useState<RutinaPendiente[]>([])
  const [totalPendientes, setTotalPendientes] = useState(0)
  const [paginaPendientes, setPaginaPendientes] = useState(1)
  const [isCargandoPendientes, setIsCargandoPendientes] = useState(false)
  const [errorPendientes, setErrorPendientes] = useState('')

  const cargarRealizados = useCallback(async () => {
    if (!atletaId || tabActivo !== 'realizados') return
    setIsCargandoRealizados(true)
    setErrorRealizados('')
    try {
      const res = await obtenerEntrenamientosRealizados(atletaId, { pagina: paginaRealizados, limite: LIMITE_RUTINAS })
      setRealizados(res.datos)
      setTotalRealizados(res.total)
    } catch {
      setErrorRealizados('No se pudieron cargar los entrenamientos realizados')
    } finally {
      setIsCargandoRealizados(false)
    }
  }, [atletaId, tabActivo, paginaRealizados])

  useEffect(() => {
    void cargarRealizados()
  }, [cargarRealizados])

  const cargarPendientes = useCallback(async () => {
    if (!atletaId || tabActivo !== 'pendientes') return
    setIsCargandoPendientes(true)
    setErrorPendientes('')
    try {
      const res = await obtenerRutinasPendientes(atletaId, { pagina: paginaPendientes, limite: LIMITE_RUTINAS })
      setPendientes(res.datos)
      setTotalPendientes(res.total)
    } catch {
      setErrorPendientes('No se pudieron cargar las rutinas pendientes')
    } finally {
      setIsCargandoPendientes(false)
    }
  }, [atletaId, tabActivo, paginaPendientes])

  useEffect(() => {
    void cargarPendientes()
  }, [cargarPendientes])

  const cargar = useCallback(async () => {
    if (!atletaId) return
    setIsCargando(true)
    setError('')
    try {
      setPerfil(await obtenerEntrenado(atletaId))
    } catch {
      setError('No se pudo cargar el perfil del atleta')
    } finally {
      setIsCargando(false)
    }
  }, [atletaId])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const abrirModal = () => {
    if (!perfil) return
    setObjetivo(perfil.objetivoPrincipal ?? '')
    setDias(perfil.diasPorSemana ?? 3)
    setDescripcion(perfil.descripcion ?? '')
    setModalError('')
    setModalAbierto(true)
  }

  const handleGuardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!atletaId) return
    setModalError('')
    setIsEnviando(true)
    try {
      await guardarPerfilAtleta(atletaId, {
        objetivoPrincipal: objetivo || undefined,
        diasPorSemana: dias,
        descripcion: descripcion.trim() || undefined,
      })
      setModalAbierto(false)
      void cargar()
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setModalError(axiosErr.response?.data?.error ?? 'Error al guardar el perfil')
    } finally {
      setIsEnviando(false)
    }
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/entrenados')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Listado de atletas
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil del atleta</h1>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {isCargando ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Cargando…</div>
      ) : perfil ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <Avatar name={perfil.atleta.nombre} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{perfil.atleta.nombre}</h2>
                  <span className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${estadoEstilos[perfil.estado]}`}>
                    {perfil.estado}
                  </span>
                </div>
              </div>
              <button
                onClick={abrirModal}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Objetivo principal</dt>
                <dd className="text-gray-900 font-medium">
                  {perfil.objetivoPrincipal ? OBJETIVO_ETIQUETAS[perfil.objetivoPrincipal] : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Días por semana</dt>
                <dd className="text-gray-900 font-medium">{perfil.diasPorSemana ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Último entrenamiento</dt>
                <dd className="text-gray-900 font-medium">{formatearFecha(perfil.ultimoEntrenamiento)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Rutinas pendientes</dt>
                <dd className="text-gray-900 font-medium">{perfil.rutinasPendientes}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Vinculado desde</dt>
                <dd className="text-gray-900 font-medium">{formatearFecha(perfil.vinculadoDesde)}</dd>
              </div>
            </dl>

            {perfil.descripcion && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Descripción</dt>
                <dd className="text-sm text-gray-600 whitespace-pre-wrap">{perfil.descripcion}</dd>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabActivo(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    tabActivo === tab.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.id === 'pendientes'
                    ? `Rutinas pendientes (${perfil.rutinasPendientes})`
                    : tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tabActivo === 'realizados' && (
                <ListadoRutinas
                  items={realizados.map((r) => ({
                    id: r.id,
                    fecha: r.completadoEn,
                    nombre: r.nombreRutina ?? 'Rutina',
                    comentario: r.comentario,
                    onVerDetalle: () => navigate(`/entrenamientos/${r.id}`),
                  }))}
                  total={totalRealizados}
                  pagina={paginaRealizados}
                  onCambiarPagina={setPaginaRealizados}
                  isCargando={isCargandoRealizados}
                  error={errorRealizados}
                  vacio="Todavía no hay entrenamientos completados"
                />
              )}
              {tabActivo === 'pendientes' && (
                <ListadoRutinas
                  items={pendientes.map((r) => ({
                    id: r.id,
                    fecha: r.fecha,
                    nombre: r.nombreRutina ?? 'Rutina',
                    comentario: null,
                    onVerDetalle: () => navigate(`/entrenamientos/${r.id}`),
                  }))}
                  total={totalPendientes}
                  pagina={paginaPendientes}
                  onCambiarPagina={setPaginaPendientes}
                  isCargando={isCargandoPendientes}
                  error={errorPendientes}
                  vacio="No hay rutinas pendientes"
                />
              )}
              {tabActivo === 'estadisticas' && (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                  Estadísticas (próximamente)
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <UserRound className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          No se encontró el atleta
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Editar perfil</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivo principal
                </label>
                <select
                  id="objetivo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as ObjetivoPrincipal | '')}
                >
                  <option value="">Sin definir</option>
                  {(Object.keys(OBJETIVO_ETIQUETAS) as ObjetivoPrincipal[]).map((key) => (
                    <option key={key} value={key}>
                      {OBJETIVO_ETIQUETAS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dias" className="block text-sm font-medium text-gray-700 mb-1">
                  Días por semana
                </label>
                <input
                  id="dias"
                  type="number"
                  min={1}
                  max={7}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Objetivos, lesiones, preferencias…"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isEnviando}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isEnviando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
